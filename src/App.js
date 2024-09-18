import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import GraphQLOffset from "./components/GraphQLOffset";
import GraphQLCursor from "./components/GraphQLCursor";
import "./styles.css"; // Import styles if necessary

// Create a client for React Query
const queryClient = new QueryClient();

// The Home component with links to the four examples
const Home = () => {
  return (
    <div className="container">
      <h1 className="my-5">GraphQL pagination examples</h1>
      <ul className="list-group">
        <li className="list-group-item">
          <Link to="/offset">Offset-based</Link>
        </li>
        <li className="list-group-item">
          <Link to="/cursor">Cursor-based</Link>
        </li>
      </ul>
    </div>
  );
};

// The main App component with routing
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          =
          <Route path="/offset" element={<GraphQLOffset />} />
          <Route path="cursor" element={<GraphQLCursor />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
