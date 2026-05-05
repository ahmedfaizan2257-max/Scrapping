import axios from "axios";

async function run() {
  try {
    const res = await axios.post("http://localhost:3000/api/process", {
      source: "yellow-pages",
      query: "Plumber",
      location: "Toronto",
      scheduledInterval: 0
    });
    console.log("Triggered scrape. Job ID:", res.data);
    
    // Poll for results
    for (let i = 0; i < 15; i++) {
       await new Promise(r => setTimeout(r, 2000));
       const leadsRes = await axios.get("http://localhost:3000/api/records");
       console.log("Found leads so far:", leadsRes.data.length);
       if (leadsRes.data.length > 0) break;
    }

  } catch(e) {
    console.error("Error:", e.response?.data || e.message);
  }
}
run();
