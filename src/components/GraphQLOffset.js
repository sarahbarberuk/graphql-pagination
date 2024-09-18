import React, { useState, useEffect } from "react";
import ".././styles.css"; // Add this line to link the CSS file

const ServerSide = () => {
  const [posts, setPosts] = useState([]); // State to hold posts
  const [loading, setLoading] = useState(false); // Loading state
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [totalPosts, setTotalPosts] = useState(0); // Total number of posts
  const [postsPerPage] = useState(2); // Number of posts per page

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);

      // GraphQL query for paginated blog posts
      const query = `
        query {
          blogPostCollection(limit: ${postsPerPage}, skip: ${
        (currentPage - 1) * postsPerPage
      }) {
            total
            items {
              title
              date
              excerpt
            }
          }
        }
      `;

      const response = await fetch(
        `https://graphql.contentful.com/content/v1/spaces/${process.env.REACT_APP_CONTENTFUL_SPACE_ID}`, // Use environment variables for Contentful
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_CONTENTFUL_ACCESS_TOKEN}`, // Access token from .env file
          },
          body: JSON.stringify({ query }), // Pass query as the request body
        }
      );

      const jsonData = await response.json();
      const data = jsonData.data.blogPostCollection;

      // Update state with the posts and total number of posts
      setPosts(data.items);
      setTotalPosts(data.total);
      setLoading(false);
    };

    fetchPosts();
  }, [currentPage, postsPerPage]); // Fetch the next page of posts when the current page changes

  return (
    <div className="container">
      <h1 className="my-5">Blog Posts</h1>
      {loading ? <p>Loading...</p> : <PostList posts={posts} />}
      <Pagination
        postsPerPage={postsPerPage}
        totalPosts={totalPosts}
        currentPage={currentPage}
        paginate={setCurrentPage} // Passing setCurrentPage to handle page change
      />
    </div>
  );
};

const PostList = ({ posts }) => {
  return (
    <ul className="list-group mb-4">
      {posts.map((post, index) => (
        <li key={index} className="list-group-item">
          <h3>{post.title}</h3>
          <p>{post.excerpt}</p>
          <small>{new Date(post.date).toLocaleDateString()}</small>
        </li>
      ))}
    </ul>
  );
};

const Pagination = ({ postsPerPage, totalPosts, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
    pageNumbers.push(i);
  }

  const handleClick = (e, number) => {
    e.preventDefault(); // Prevent default anchor behavior
    paginate(number);
  };

  return (
    <nav>
      <ul className="pagination">
        {pageNumbers.map((number) => (
          <li
            key={number}
            className={`page-item ${currentPage === number ? "active" : ""}`}
          >
            <a
              onClick={(e) => handleClick(e, number)} // Added e.preventDefault()
              href="!#"
              className="page-link"
            >
              {number}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default ServerSide;
