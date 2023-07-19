/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-restricted-syntax */
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function GameBoard() {
  const host = import.meta.env.VITE_BACKEND_URL;
  const [imagesFood, setImagesFood] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectionCount, setSelectionCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    axios
      .get(`${host}/foods`)
      .then((res) =>
        setImagesFood(res.data.sort(() => Math.random() - 0.5).slice(0, 2))
      )
      .catch((err) => {
        console.error(err);
      });
  }, [selectionCount]);

  const updateVote = (imageId, newVote) => {
    axios
      .put(`${host}/foods/${imageId}`, { vote: newVote })
      .then(() => {
        console.log("Vote updated successfully!");
        setHasVoted(true);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const handleSelect = (imageId) => {
    if (!hasVoted) {
      if (selectedImage === imageId) {
        setSelectedImage(null);
      } else {
        setSelectedImage(imageId);
        const updatedImages = imagesFood.map((image) => {
          if (image.id === imageId) {
            const newVote = image.vote + 1;
            updateVote(imageId, newVote);
            return { ...image, vote: newVote };
          }
          return image;
        });

        setImagesFood(updatedImages);
      }
    }
  };

  const handleNextClick = () => {
    setSelectionCount(selectionCount + 1);
    setSelectedImage(null);
    setHasVoted(null);
    if (selectionCount === 4) {
      setGameOver(true);
    }
  };

  const calculatePercentage = (votes, totalVotes) => {
    if (totalVotes === 0) return 0;
    return ((votes / totalVotes) * 100).toFixed(2);
  };

  return (
    <div>
      {gameOver ? (
        <>
          <p>Fin du jeu</p>
          <Link to="/summary" className="endgame-button">
            <button type="button">Voir les résultats</button>
          </Link>
        </>
      ) : (
        <>
          {imagesFood.map((image) => (
            <div key={image.id} onClick={() => handleSelect(image.id)}>
              <figure>
                <img
                  src={`${host}/assets/images/${image.img}`}
                  alt={image.title}
                />
                <figcaption>{image.title}</figcaption>
              </figure>
              <p>
                {hasVoted &&
                  ` ${calculatePercentage(
                    image.vote,
                    imagesFood.reduce((total, img) => total + img.vote, 0)
                  )}%`}
              </p>
              {selectedImage && <p>{image.vote} votes</p>}
            </div>
          ))}
          {selectedImage && (
            <button type="button" onClick={handleNextClick}>
              Suivant
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default GameBoard;
