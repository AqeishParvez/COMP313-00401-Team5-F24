// const checkoutBtn = document.querySelector('.checkout')


// checkoutBtn.addEventListener('click',()=>{
//     console.log("Woza");
    
// })

console.log("Woza");


fetch('http://localhost:5001/notifications') // Replace with your URL
  .then(response => {
    if (!response.ok) {
      // Handle network errors or non-200 responses
      throw new Error('Network response was not ok');
    }
    return response.json();  // Parse the JSON data from the response
  })
  .then(data => {
    console.log('Data:', data);  // Handle the data
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });