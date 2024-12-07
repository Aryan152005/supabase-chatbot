import React, { useState } from 'react';

const UploadForm = () => {
  const [file, setFile] = useState<File | null>(null);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      // Make a POST request to the API route
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        alert('File uploaded successfully!');
      } else {
        alert('File upload failed!');
      }
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto h-[600px] bg-gray-800 rounded-lg shadow-xl overflow-hidden">
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default UploadForm;
