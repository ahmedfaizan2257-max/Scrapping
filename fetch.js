async function go() {
  try {
    const res = await fetch("http://localhost:3000/api/tasks");
    console.log("STATUS:", res.status);
    const text = await res.text();
    console.log("BODY:", text);
  } catch (e) {
    console.error("ERROR:", e);
  }
}
go();
