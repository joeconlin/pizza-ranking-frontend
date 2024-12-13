import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import '../styles/styles.css';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';

function Leaderboard() {
  const { userCode, userName } = useContext(UserContext);
  const [leaderboard, setLeaderboard] = useState([]);
  const [categoryWinners, setCategoryWinners] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`${API_URL}/get-leaderboard`);
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }
        const data = await response.json();

        if (data.length === 0) {
          setLeaderboard([]);
          setCategoryWinners(null);
          setLoading(false);
          return;
        }

        const sanitizedData = data.map((spot) => ({
          ...spot,
          averageScore: parseFloat(spot.averageScore) || 0,
        }));

        const sortedData = sanitizedData.sort((a, b) => b.averageScore - a.averageScore);

        const winners = {
          crust: null,
          sauce: null,
          cheese: null,
          flavor: null,
        };
        sortedData.forEach((spot) => {
          if (!winners.crust || spot.averageCrust > winners.crust.score) {
            winners.crust = { spotName: spot.spotName, score: spot.averageCrust };
          }
          if (!winners.sauce || spot.averageSauce > winners.sauce.score) {
            winners.sauce = { spotName: spot.spotName, score: spot.averageSauce };
          }
          if (!winners.cheese || spot.averageCheese > winners.cheese.score) {
            winners.cheese = { spotName: spot.spotName, score: spot.averageCheese };
          }
          if (!winners.flavor || spot.averageOverallFlavor > winners.flavor.score) {
            winners.flavor = { spotName: spot.spotName, score: spot.averageOverallFlavor };
          }
        });

        setCategoryWinners(winners);
        setLeaderboard(sortedData);
        calculateUserStats(sortedData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leaderboard:', error.message);
        setLoading(false);
      }
    };

    const calculateUserStats = async (overallLeaderboard) => {
      try {
        const userResponse = await fetch(
          `${API_URL}/get-user-ratings?userCode=${userCode}`  // Changed from clientUID
        );
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user ratings');
        }
        const userRatings = await userResponse.json();

        if (userRatings.length === 0) {
          setUserStats(null);
          return;
        }

        const userScores = {
          totalSpotsRated: userRatings.length,
          averageCrust: 0,
          averageSauce: 0,
          averageCheese: 0,
          averageOverallFlavor: 0,
          favoriteSpot: null,
        };

        let highestOverallScore = 0;

        userRatings.forEach((rating) => {
          userScores.averageCrust += Number(rating.crust);
          userScores.averageSauce += Number(rating.sauce);
          userScores.averageCheese += Number(rating.cheese);
          userScores.averageOverallFlavor += Number(rating.overallFlavor);

          const totalScore =
            Number(rating.crust) +
            Number(rating.sauce) +
            Number(rating.cheese) +
            Number(rating.overallFlavor);

          if (totalScore > highestOverallScore) {
            highestOverallScore = totalScore;
            userScores.favoriteSpot = rating.spotName;
          }
        });

        const totalRatings = userRatings.length;
        if (totalRatings > 0) {
          userScores.averageCrust = (userScores.averageCrust / totalRatings).toFixed(1);
          userScores.averageSauce = (userScores.averageSauce / totalRatings).toFixed(1);
          userScores.averageCheese = (userScores.averageCheese / totalRatings).toFixed(1);
          userScores.averageOverallFlavor = (
            userScores.averageOverallFlavor / totalRatings
          ).toFixed(1);
        }

        const maxAverage = Math.max(
          userScores.averageCrust,
          userScores.averageSauce,
          userScores.averageCheese,
          userScores.averageOverallFlavor
        );

        if (maxAverage === parseFloat(userScores.averageCrust)) {
          userScores.title = `${userName} is a 🥖 Crust Connoisseur!`;
        } else if (maxAverage === parseFloat(userScores.averageSauce)) {
          userScores.title = `${userName} is a 🍅 Sauce Boss!`;
        } else if (maxAverage === parseFloat(userScores.averageCheese)) {
          userScores.title = `${userName} is a 🧀 Cheese Freak!`;
        } else {
          userScores.title = `${userName} is a 🌟 Flavor Fanatic!`;
        }

        setUserStats(userScores);
      } catch (error) {
        console.error('Error calculating user stats:', error.message);
      }
    };

    fetchLeaderboard();
  }, [clientUID, userName]);

  if (loading) {
    return <div className="text-center">Loading leaderboard...</div>;
  }

  if (leaderboard.length === 0) {
    return <div className="text-center">No ratings available yet. Be the first to rate!</div>;
  }

  return (
    <div className="leaderboard-container">
      <h2 className="text-center">🏆 Leaderboard 🏆</h2>
      {categoryWinners && (
        <div className="category-winners">
          <h4 className="text-center">🏅 Category Winners 🏅</h4>
          <ul>
            {categoryWinners.crust && <li>Best Crust: <b>{categoryWinners.crust.spotName}</b> ({categoryWinners.crust.score})</li>}
            {categoryWinners.sauce && <li>Best Sauce: <b>{categoryWinners.sauce.spotName}</b> ({categoryWinners.sauce.score})</li>}
            {categoryWinners.cheese && <li>Best Cheese: <b>{categoryWinners.cheese.spotName}</b> ({categoryWinners.cheese.score})</li>}
            {categoryWinners.flavor && <li>Best Overall Flavor: <b>{categoryWinners.flavor.spotName}</b> ({categoryWinners.flavor.score})</li>}
          </ul>
        </div>
      )}
      <h3 className="text-center mb-4">Top-Ranked Spots</h3>
      <div className="leaderboard-table">
        <div className="leaderboard-header">
          <span>Rank</span>
          <span className="leaderboard-spot-header">Spot</span>
          <span>Avg. Score</span>
        </div>
        {leaderboard.map((spot, index) => (
          <div className="leaderboard-row" key={index}>
            <span className="leaderboard-rank">{index + 1}</span>
            <div className="leaderboard-spot-info">
            <Link
              to="/ranking-form"
              state={{
                spotName: spot.spotName,
                address: spot.address, // Assuming you have address data
                description: spot.description, // Assuming you have description data
                clientUID: clientUID, // Pass clientUID if required
              }}
              className="leaderboard-spot"
            >
              {spot.spotName}
            </Link>

              <span className="leaderboard-subheading">
                🥖 {spot.averageCrust || '-'} 🍅 {spot.averageSauce || '-'} 🧀 {spot.averageCheese || '-'} 🌟 {spot.averageOverallFlavor || '-'}
              </span>
            </div>
            <span className="leaderboard-score">{spot.averageScore}</span>
          </div>
        ))}
      </div>
      {userStats && (
        <div className="user-stats mt-5">
          <h3 className="text-center">{userStats.title}</h3>
          <p>Favorite Spot: <b>{userStats.favoriteSpot}</b></p>
          <p>Total Spots Rated: <b>{userStats.totalSpotsRated}</b></p>
          <p>Average Crust Score: <b>{userStats.averageCrust}</b></p>
          <p>Average Sauce Score: <b>{userStats.averageSauce}</b></p>
          <p>Average Cheese Score: <b>{userStats.averageCheese}</b></p>
          <p>Average Overall Flavor: <b>{userStats.averageOverallFlavor}</b></p>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
