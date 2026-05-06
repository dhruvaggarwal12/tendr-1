const axios = require('axios');
const config = require('../config');
const { setAsync, getAsync, delAsync } = require('../config/redis');

const OTP_TTL = 5 * 60;        // 5 minutes
const MAX_SEND_ATTEMPTS = 5;
const PHONE_VERIFIED_TTL = 10 * 60;   // optional rate limit

/**
 * sendOTP
 *   - Calls Message Central’s “send OTP” endpoint over HTTP.
 *   - Stores { verificationId, sentCount } in Redis under key `otp:<normalizedPhone>`.
 *   - Returns the raw `data` object (so that router can pull out verificationId).
 */
async function sendOTP(phoneNumber) {
  // 1) Normalize phone: strip leading '+' if present
  

  const redisKey = `otp:${phoneNumber}`;
  const existing = await getAsync(redisKey);
  if (existing) {
    // Rate-limit: if we already sent too many
    try {
      const parsedPrevious = JSON.parse(existing);
      if ((parsedPrevious.sentCount || 0) >= MAX_SEND_ATTEMPTS) {
        throw new Error('Too many OTP requests. Please try again later.');
      }
    } catch {
      // If Redis data is malformed, ignore and overwrite
    }
  }

  // 2) Call Message Central’s “send OTP” endpoint
  const url =
    'https://cpaas.messagecentral.com/verification/v3/send' +
    `?countryCode=91` +
    `&customerId=${encodeURIComponent(config.MESSAGE_CENTRAL_CUSTOMER_ID)}` +
    `&flowType=SMS` +
    `&mobileNumber=${encodeURIComponent(phoneNumber)}`;

  let axiosRes;
  try {
    axiosRes = await axios.post(url, null, {
      headers: {
        'authToken': config.MESSAGE_CENTRAL_AUTH_TOKEN,
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.error('Message Central send-OTP error:', err.response?.data || err.message);
    throw new Error('Failed to send OTP. Please try again.');
  }

  const body = axiosRes.data;
  // Now check the actual fields
  if (!body || body.responseCode !== 200 || body.message !== 'SUCCESS') {
    console.error('Message Central send-OTP returned error:', body);
    throw new Error(body.error || body.description || 'Error sending OTP');
  }

  // It lives inside .data.verificationId
  const verificationId = body.data?.verificationId;
  if (!verificationId) {
    console.error('No verificationId in Message Central response:', body);
    throw new Error('Failed to get verification ID from OTP provider');
  }

  // 3) Track how many times we’ve sent OTP
  let sentCount = 1;
  if (existing) {
    try {
      const parsedPrev = JSON.parse(existing);
      sentCount = (parsedPrev.sentCount || 0) + 1;
    } catch {
      sentCount = 1;
    }
  }

  // 4) Store { verificationId, sentCount } in Redis (5‐minute TTL)
  const redisValue = JSON.stringify({ verificationId, sentCount });
  await setAsync(redisKey, redisValue, 'EX', OTP_TTL);

  // **Return the entire `body.data` object** so that router can do:
  //    const { verificationId } = sendResult;
  return body.data;
}

/**
 * verifyOTP
 *   - Pulls { verificationId } from Redis under `otp:<normalizedPhone>`
 *   - Calls Message Central’s “validateOtp” endpoint
 *   - On success, deletes the Redis key; on failure, deletes it and throws.
 */
async function verifyOTP(rawPhone, otp) {
  // 1) Fetch the saved { verificationId } from Redis
  const redisKey = `otp:${rawPhone}`;
  const stored = await getAsync(redisKey);
  if (!stored) {
    throw new Error('OTP expired or not requested');
  }

  let parsed;
  try {
    parsed = JSON.parse(stored);
  } catch {
    // corrupted Redis data → force a re-send next time
    await delAsync(redisKey);
    throw new Error('OTP data corrupted. Please request a new OTP.');
  }

  const { verificationId } = parsed;
  if (!verificationId) {
    await delAsync(redisKey);
    throw new Error('No verificationId found. Please request a new OTP.');
  }

  // 2) Build CPaaS “validateOtp” URL
  const url =
    'https://cpaas.messagecentral.com/verification/v3/validateOtp' +
    `?countryCode=91` +
    `&mobileNumber=${encodeURIComponent(rawPhone)}` +
    `&verificationId=${encodeURIComponent(verificationId)}` +
    `&customerId=${encodeURIComponent(config.MESSAGE_CENTRAL_CUSTOMER_ID)}` +
    `&code=${encodeURIComponent(otp)}`;

  let axiosRes;
  try {
    axiosRes = await axios.get(url, {
      headers: {
        'authToken': config.MESSAGE_CENTRAL_AUTH_TOKEN,
        'Content-Type': 'application/json'
      }
    });
  } catch (err) {
    console.error('Message Central verify-OTP error:', err.response?.data || err.message);
    // Delete Redis so user must request again
    await delAsync(redisKey);
    throw new Error('Error verifying OTP. Please try again.');
  }

  const body = axiosRes.data;
  // CPaaS returns something like:
  // {
  //   responseCode: 200,
  //   message: "SUCCESS",
  //   data: {
  //     verificationId: 46840,
  //     mobileNumber: "9899400303",
  //     verificationStatus: "VERIFICATION_COMPLETED",
  //     ...
  //   }
  // }
  if (
    !body ||
    body.responseCode !== 200 ||
    body.message !== 'SUCCESS' ||
    !body.data ||
    body.data.verificationStatus !== 'VERIFICATION_COMPLETED'
  ) {
    console.error('Message Central verify-OTP returned error:', body);
    await delAsync(redisKey);
    throw new Error(
      body.errorMessage ||
      body.message ||
      'Invalid or expired OTP'
    );
  }

  // 3) Verified → delete Redis key and return true
  await delAsync(redisKey);
  return true;
}

const setPhoneVerified = async (phoneNumber) => {
  const key = `phoneVerified:vendor:${phoneNumber}`;
  await setAsync(key, '1', 'EX', PHONE_VERIFIED_TTL);
};

const setConsumerPhoneVerified = async (phoneNumber) => {
  const key = `phoneVerified:consumer:${phoneNumber}`;
  await setAsync(key, '1', 'EX', PHONE_VERIFIED_TTL);
};

const checkPhoneVerified = async (phoneNumber) => {
  const key = `phoneVerified:vendor:${phoneNumber}`;
  const value = await getAsync(key);
  return value === '1';
};

const checkConsumerPhoneVerified = async (phoneNumber) => {
  const key = `phoneVerified:consumer:${phoneNumber}`;
  const value = await getAsync(key);
  return value === '1';
};

module.exports = { sendOTP, verifyOTP, setPhoneVerified, setConsumerPhoneVerified,
  checkPhoneVerified, checkConsumerPhoneVerified };
