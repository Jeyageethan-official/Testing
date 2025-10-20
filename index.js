// This file is loaded as a module. It will define the AI function 
// and attach it to the window object so the main script in index.html can call it.

// Since the AI logic is now on a secure backend (Firebase Cloud Function),
// we no longer need the GoogleGenAI library on the frontend.

// This function calls our secure backend function.
async function generateProfessionalMessage(userInput) {
  try {
    // Get a reference to the callable function
    const getProfessionalMessage = firebase.functions().httpsCallable('getProfessionalMessage');
    
    // Call the function with the user's input text
    const result = await getProfessionalMessage({ text: userInput });

    // The result from the cloud function is in result.data
    return result.data;

  } catch (error) {
    console.error("Error calling getProfessionalMessage cloud function:", error);
    // Provide a user-friendly error message
    throw new Error("The AI assistant could not be reached. Please try again later.");
  }
}

// Attach the function to the window object to make it globally accessible
// from the script in index.html.
window.generateProfessionalMessage = generateProfessionalMessage;
