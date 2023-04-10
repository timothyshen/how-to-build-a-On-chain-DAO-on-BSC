import react, { useState } from "react";

const CreateProposal = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const createOne = async (contract) => {
    try {
      console.log(contract);
      // Validate input
      if (!title || !description) {
        alert("Please enter a title and description for the proposal.");
        return;
      }

      // Send the createProposal transaction
      const result = await contract.methods
        .createProposal(title, description)
        .call();

      // Check for successful transaction
      if (result.status) {
        alert("Proposal created successfully");
        setTitle("");
        setDescription("");
        // Fetch updated proposals
        getAllProposals();
      } else {
        alert("Error creating proposal");
      }
    } catch (error) {
      alert(`Error submitting proposal: ${error.message}`);
    }
  };

  return (
    <div>
      <h3>Create a Proposal</h3>
      <input
        type="text"
        placeholder="Proposal Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Proposal Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button onClick={createOne}>Submit Proposal</button>
    </div>
  );
};

export default CreateProposal;
