import React from "react";

import Calendar from "./components/Calendar";

import "./App.css";

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="app-header">
        </header>
        <main>
          <Calendar />
        </main>
      </div>
    );
  }
}

export default App;
