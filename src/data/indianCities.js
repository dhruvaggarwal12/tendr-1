/* Major Indian cities for the city-picker dropdown — not exhaustive (every town),
   but broad coverage across all states/UTs so search feels complete. Cities Tendr
   currently has vendors in are listed first so they surface at the top unfiltered. */
export const SERVICED_CITIES = ["Delhi", "Noida", "Greater Noida", "Ghaziabad"];

export const OTHER_INDIAN_CITIES = [
  "Mumbai","Pune","Nagpur","Nashik","Thane","Aurangabad","Navi Mumbai","Kolhapur","Solapur","Amravati",
  "Bengaluru","Mysuru","Mangaluru","Hubballi","Belagavi","Chennai","Coimbatore","Madurai","Tiruchirappalli","Salem","Tiruppur","Erode","Vellore",
  "Hyderabad","Warangal","Nizamabad","Visakhapatnam","Vijayawada","Guntur","Tirupati","Nellore","Kurnool",
  "Kochi","Thiruvananthapuram","Kozhikode","Thrissur","Kollam","Kannur",
  "Kolkata","Howrah","Durgapur","Asansol","Siliguri",
  "Jaipur","Jodhpur","Udaipur","Kota","Ajmer","Bikaner","Alwar",
  "Ahmedabad","Surat","Vadodara","Rajkot","Gandhinagar","Bhavnagar","Jamnagar",
  "Lucknow","Kanpur","Agra","Varanasi","Allahabad (Prayagraj)","Meerut","Bareilly","Aligarh","Moradabad","Saharanpur","Gorakhpur","Noida","Firozabad","Jhansi",
  "Gurugram","Faridabad","Panipat","Ambala","Karnal","Hisar","Rohtak","Sonipat","Yamunanagar",
  "Chandigarh","Mohali","Ludhiana","Amritsar","Jalandhar","Patiala","Bathinda",
  "Bhopal","Indore","Jabalpur","Gwalior","Ujjain","Sagar",
  "Patna","Gaya","Muzaffarpur","Bhagalpur","Darbhanga",
  "Ranchi","Jamshedpur","Dhanbad","Bokaro",
  "Bhubaneswar","Cuttack","Rourkela","Puri",
  "Raipur","Bhilai","Bilaspur","Durg",
  "Guwahati","Dibrugarh","Silchar","Jorhat",
  "Dehradun","Haridwar","Rishikesh","Nainital",
  "Shimla","Manali","Dharamshala",
  "Srinagar","Jammu",
  "Panaji","Margao",
  "Imphal","Shillong","Aizawl","Kohima","Agartala","Itanagar","Gangtok",
  "Chandigarh","Puducherry",
].filter((c, i, arr) => arr.indexOf(c) === i); // de-dupe (Noida/Chandigarh appear in two regional groupings above)

export const ALL_INDIAN_CITIES = [...SERVICED_CITIES, ...OTHER_INDIAN_CITIES.filter(c => !SERVICED_CITIES.includes(c))];
