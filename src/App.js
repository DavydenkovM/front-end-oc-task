import React from "react";

import Calendar from "./Calendar";

import "./App.css";

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="app-header">
          <div id="logo">
            <span className="calendar-icon">date_range</span>
            <span>
              <b>Event calendar</b>
            </span>
          </div>
        </header>
        <main>
          <Calendar />
        </main>
      </div>
    );
  }
}

export default App;
