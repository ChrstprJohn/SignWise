import { useState } from 'react';
import { Star } from 'lucide-react';

const messages = [
  'The review made my document easier to understand.',
  'The red flags helped me know what to ask.',
  'I would like more detail in the review.',
];
const ratings = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

export default function ReviewFeedback() {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [choice, setChoice] = useState('');
  const [custom, setCustom] = useState('');
  const [preview, setPreview] = useState(null);
  const message = choice === 'custom' ? custom.trim() : choice;

  function previewFeedback(event) {
    event.preventDefault();
    setPreview({ rating, name: name.trim(), message });
  }

  return <section className="review-feedback" aria-labelledby="feedback-heading">
    <div className="feedback-intro">
      <h2 id="feedback-heading">How was your review?</h2>
      <p>Tell us what helped, or what could be better.</p>
      <p className="feedback-note" id="feedback-preview-note">Form preview only. Your feedback isn’t sent or saved.</p>
    </div>
    <form className="feedback-form ph-no-capture" onSubmit={previewFeedback} aria-describedby="feedback-preview-note">
      <fieldset className="feedback-rating">
        <legend>Your rating</legend>
        <div className="feedback-stars">{ratings.map((label, index) => <label className="feedback-star" key={label}>
          <input type="radio" name="feedback-rating" value={index + 1} checked={rating === index + 1} onChange={() => { setRating(index + 1); setPreview(null); }} required aria-label={`${index + 1} ${index === 0 ? 'star' : 'stars'} — ${label}`} />
          <Star size={28} strokeWidth={1.5} fill={rating > index ? 'currentColor' : 'none'} aria-hidden="true" />
        </label>)}<span className="feedback-rating-label">{rating ? ratings[rating - 1] : 'Choose a rating'}</span></div>
      </fieldset>
      <label className="feedback-field" htmlFor="feedback-name">Your name
        <input id="feedback-name" name="name" autoComplete="name" maxLength={80} value={name} onChange={event => { setName(event.target.value); setPreview(null); }} placeholder="Name to display" required pattern=".*\S.*" />
      </label>
      <fieldset className="feedback-messages">
        <legend>Your message</legend>
        <div className="feedback-options">{[...messages, 'custom'].map(option => <label className="feedback-option" key={option}>
          <input type="radio" name="feedback-message" value={option} checked={choice === option} onChange={() => { setChoice(option); setPreview(null); }} required />
          <span>{option === 'custom' ? 'Write my own message' : option}</span>
        </label>)}</div>
      </fieldset>
      {choice === 'custom' && <label className="feedback-field" htmlFor="feedback-custom">Your custom message
        <textarea id="feedback-custom" rows={3} maxLength={500} value={custom} onChange={event => { setCustom(event.target.value); setPreview(null); }} placeholder="What would you like to tell us?" required />
        <small>{custom.length}/500 characters</small>
      </label>}
      <button className="button button-primary" type="submit" disabled={!rating || !name.trim() || !message}>Preview feedback</button>
      {preview && <div className="feedback-preview" role="status">
        <p className="feedback-preview-heading">Your feedback preview · {preview.rating}/5 stars</p>
        <blockquote>{preview.message}</blockquote>
        <p>{preview.name}</p>
      </div>}
    </form>
  </section>;
}
