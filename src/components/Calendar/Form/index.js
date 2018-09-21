import React from "react";
import cn from "classnames";

class Form extends React.Component {
  componentDidMount() {
    // because react-tippy treat passed html as prop
    // and marked input not actually in DOM
    setTimeout(() => this.hourInput.focus(), 0)
  }

  render() {
    const {onFormSubmit, onInputChange, formState} = this.props;

    return (
      <form className="event-form" onSubmit={onFormSubmit}>
        <div className="event-form__row">
          <input
            className="event-form__row-item"
            type="text" name="hour"
            placeholder="Hour"
            onChange={onInputChange}
            value={formState.hourText}
            ref={(input) => {this.hourInput = input}}
          />
          <input
            className="event-form__row-item"
            type="text" name="minute"
            placeholder="Minute"
            onChange={onInputChange}
            value={formState.minuteText}/>
        </div>

        <div className="event-form__row">
          <input
            className="event-form__row-item"
            type="text" name="eventName"
            placeholder="Event Name"
            onChange={onInputChange}
            value={formState.eventNameText}
          />
        </div>

        <div className="event-form__row">
          <div className="event-form__save-btn-wrapper">
            <button
              type="submit"
              className={cn("event-form__row-item", "event-form__save-btn", `${!formState.isFormInputValid && 'event-form__save-btn--disabled'}`)}
              disabled={!formState.isFormInputValid}
            >
              Save
            </button>
          </div>
        </div>
      </form>
    )
  }
}

export default Form;
