import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchEvent } from "../api";

const EventPage = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    fetchEvent(id).then((response) => setEvent(response.data));
  }, [id]);

  if (!event) return <p>Loading...</p>;

  return (
    <div>
      <h1>{event.title}</h1>
      <img src={event.image_url} alt={event.title} />
      <p>{event.theme}</p>
      <p>{event.details}</p>
      <p>{event.date_time}</p>
      <p>{event.location}</p>
    </div>
  );
};

export default EventPage;