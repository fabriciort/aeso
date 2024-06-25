import React from "react";

const Card = ({ title, description, link, image }) => {
  return (
    <div className="card">
      <div className="card-image">
        <img src={image} alt={title} />
      </div>
      <div className="card-content">
        <h2>{title}</h2>
        <p>{description}</p>
        <a href={link}>Learn more</a>
      </div>
    </div>
  );
};

export default Card;
