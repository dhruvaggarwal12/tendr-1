// Loads Apple's "Sign in with Apple JS" SDK once and caches the promise, since
// several signup/login surfaces on the site (Auth.jsx, AuthModal.jsx) each mount
// their own Apple sign-in button.
let appleSdkPromise = null;

export function loadAppleSdk() {
  if (typeof window !== "undefined" && window.AppleID) return Promise.resolve(window.AppleID);
  if (appleSdkPromise) return appleSdkPromise;
  appleSdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    script.async = true;
    script.onload = () => resolve(window.AppleID);
    script.onerror = () => { appleSdkPromise = null; reject(new Error("Failed to load Apple sign-in")); };
    document.head.appendChild(script);
  });
  return appleSdkPromise;
}

export async function appleSignIn() {
  const AppleID = await loadAppleSdk();
  AppleID.auth.init({
    clientId: import.meta.env.VITE_APPLE_CLIENT_ID,
    scope: "name email",
    redirectURI: import.meta.env.VITE_APPLE_REDIRECT_URI || `${window.location.origin}${window.location.pathname}`,
    usePopup: true,
  });
  const result = await AppleID.auth.signIn();
  const idToken = result?.authorization?.id_token;
  if (!idToken) throw new Error("No id_token from Apple");
  // Apple only ever sends the user's name on the very first authorization —
  // callers must capture it here and carry it through any phone-completion step.
  const name = result?.user?.name
    ? [result.user.name.firstName, result.user.name.lastName].filter(Boolean).join(" ")
    : "";
  return { idToken, name };
}
