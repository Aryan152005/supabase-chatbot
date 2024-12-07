export async function chatQuery(input: string, pdfUrl: string | null) {
    // Customize your chat logic or Hugging Face interaction here
    const response = await fetch(`/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, pdfUrl }),
    });
  
    if (!response.ok) {
      throw new Error("Failed to get response from API");
    }
  
    const data = await response.json();
    return data.message || "Sorry, I didn't get that.";
  }
  