import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { API_URL } from '../config';

// Add this function right before your RankingForm component
const getColor = (value) => {
  // Poor (0-2)
  if (value <= 2) {
    return '#EF4444';
  }
  // Below Average (2.1-4)
  else if (value <= 4) {
    return '#F97316';
  }
  // Average (4.1-6)
  else if (value <= 6) {
    return '#FBBF24';
  }
  // Good (6.1-8)
  else if (value <= 8) {
    return '#34D399';
  }
  // Excellent (8.1-10)
  else {
    return '#10B981';
  }
};

const RankingForm = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const { spotName, address, description, clientUID } = location.state || {};

  
  const [ratings, setRatings] = useState({
    crust: 5,
    sauce: 5,
    cheese: 5,
    flavor: 5,
  });
  const [notes, setNotes] = useState("");
  const [previouslyRated, setPreviouslyRated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      if (clientUID && spotName) {
        try {
          const response = await fetch(
            `${API_URL}/get-rating?clientUID=${clientUID}&spotName=${encodeURIComponent(
              spotName
            )}`
          );
          if (response.ok) {
            const data = await response.json();
            if (data.ratings) {
              setRatings(data.ratings);
              setNotes(data.notes || "");
              setPreviouslyRated(true);
            }
          } else {
            console.error("Failed to fetch ratings.");
          }
        } catch (error) {
          console.error("Error fetching ratings:", error);
        }
      }
      setIsLoading(false);
    };

    fetchRatings();
  }, [clientUID, spotName]);

  const handleRatingChange = (key, value) => {
    setRatings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = { clientUID, spotName, ratings, notes };

    try {
      const response = await fetch(`${API_URL}/submit-rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to submit the form.");

      navigate("/");
    } catch (error) {
      console.error("Error submitting the form:", error);
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="ranking-form">
      <h1>{spotName || "Unknown Spot"}</h1>
      <p className="spot-address">{address || "No address available."}</p>
      <div className="info-card">

        <p>
        {description || "No description available."}
        </p>
      </div>
      <form onSubmit={handleSubmit}>
      {["crust", "sauce", "cheese", "flavor"].map((category) => (
          <div key={category} className="rating-slider-container">
            <label htmlFor={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}:
            </label>
            <input
              id={category}
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={ratings[category]}
              onChange={(e) => handleRatingChange(category, parseFloat(e.target.value))}
              style={{
                backgroundColor: getColor(ratings[category])
              }}
            />
            <span style={{ color: getColor(ratings[category]) }}>
              {ratings[category]}
            </span>
          </div>
        ))}
        <div className="notes-container">
          <label htmlFor="notes">Notes:</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter your comments here"
          />
        </div>

        <button type="submit" className="btn-primary">
          Submit Rating
        </button>
        
        {previouslyRated && (
          <p className="update-warning"><b>
            ⚠</b> Previous scores will be overwritten! <b>⚠
          </b></p>
        )}
      </form>
    </div>
  );
};

export default RankingForm;
