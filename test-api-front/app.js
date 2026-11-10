fetch('http://localhost:3000/about')
    .then(response => response.json())
    .then(data => console.log(data));