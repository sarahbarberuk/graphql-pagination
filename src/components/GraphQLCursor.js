import React, { useState, useEffect } from "react";
import ".././styles.css"; // Add this line to link the CSS file

const GitHubRepositories = () => {
  const [repositories, setRepositories] = useState([]); // State to hold repositories
  const [loading, setLoading] = useState(false); // Loading state
  const [endCursor, setEndCursor] = useState(null); // Store the endCursor for pagination
  const [hasNextPage, setHasNextPage] = useState(false); // To track if there's a next page
  const [reposPerPage] = useState(5); // Number of repositories per page

  // Fetch repositories using GitHub's GraphQL API with cursor-based pagination
  const fetchRepositories = async (cursor = null) => {
    setLoading(true);

    // GraphQL query for paginated repositories using cursor-based pagination
    const query = `
      query ($first: Int!, $after: String) {
        viewer {
          repositories(first: $first, after: $after) {
            edges {
              node {
                name,
                description,
                createdAt,
                url
              }
            },
            pageInfo {
              endCursor,
              hasNextPage
            }
          }
        }
      }
    `;

    const variables = {
      first: reposPerPage,
      after: cursor,
    };

    try {
      const response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_GITHUB_TOKEN}`, // Use your GitHub PAT
        },
        body: JSON.stringify({ query, variables }),
      });

      const jsonData = await response.json();

      if (jsonData.errors) {
        console.error("GraphQL errors", jsonData.errors);
        setLoading(false);
        return;
      }

      const reposData = jsonData.data.viewer.repositories;

      // Update state with the repositories and cursor information
      setRepositories((prevRepos) => [
        ...prevRepos,
        ...reposData.edges.map((edge) => edge.node),
      ]);
      setEndCursor(reposData.pageInfo.endCursor); // Update the end cursor
      setHasNextPage(reposData.pageInfo.hasNextPage); // Update if there's a next page
    } catch (error) {
      console.error("Error fetching data:", error);
    }

    setLoading(false);
  };

  // Load repositories when the component mounts
  useEffect(() => {
    fetchRepositories(); // Initial fetch (without a cursor)
  }, [reposPerPage]); // Fetch the next page of repositories when the reposPerPage changes

  // Function to load more repositories
  const loadMoreRepositories = () => {
    fetchRepositories(endCursor); // Fetch more repositories using the current endCursor
  };

  return (
    <div className="container">
      <h1 className="my-5">GitHub Repositories</h1>
      {loading && !repositories.length ? (
        <p>Loading...</p>
      ) : (
        <RepositoryList repositories={repositories} />
      )}
      {hasNextPage && !loading && (
        <button onClick={loadMoreRepositories} className="btn btn-primary">
          Load More Repositories
        </button>
      )}
      {loading && repositories.length > 0 && (
        <p>Loading more repositories...</p>
      )}
    </div>
  );
};

const RepositoryList = ({ repositories }) => {
  return (
    <ul className="list-group mb-4">
      {repositories.map((repo, index) => (
        <li key={index} className="list-group-item">
          <h3>
            <a href={repo.url} target="_blank" rel="noopener noreferrer">
              {repo.name}
            </a>
          </h3>
          <p>{repo.description}</p>
          <small>
            Created at: {new Date(repo.createdAt).toLocaleDateString()}
          </small>
        </li>
      ))}
    </ul>
  );
};

export default GitHubRepositories;
