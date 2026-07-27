fetch("http://localhost:3002/api/v1/section/045a8de1-828a-494e-9d34-539ce0eafe65", {
    method: "PATCH",
    headers: {
        "Content-Type": "application/json",
        "x-institution-id": "0ea3b292-ba4d-4e2e-9103-a13e637dbfc5"
    },
    body: JSON.stringify({ name: "A" })
})
.then(res => res.text().then(text => console.log(res.status, text)))
.catch(console.error);
