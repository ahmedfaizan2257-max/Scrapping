import axios from "axios";

async function check() {
  const url = "https://www.yellowpages.ca/search/si/1/Plumber/Toronto";
  const str = `https://app.scrapingbee.com/api/v1/?api_key=7b25436fa77d416ea9d7ab052da0ccaa9efcea406f5&url=${encodeURIComponent(url)}`;
  
  try {
    const res = await axios.get(str);
    console.log("STATUS:", res.status);
    console.log("HTML Start:", res.data.substring(0, 500));
  } catch(e) {
    console.log("Error B:", e.response?.data || e.message);
  }
}
check();
