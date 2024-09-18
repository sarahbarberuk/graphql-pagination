import React, { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import ".././styles.css";

const GraphQLOffset = () => {
  const [posts, setPosts] = useState([]); // State to hold posts
  const [loading, setLoading] = useState(false); // Loading state
  const [currentPage, setCurrentPage] = useState(0); // Current page (0-indexed)
  const [totalPosts, setTotalPosts] = useState(0); // Total number of posts
  const [postsPerPage] = useState(2); // Number of posts per page

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);

      // GraphQL query for paginated blog posts
      const query = `
        query {
          blogPostCollection(limit: ${postsPerPage}, skip: ${
        currentPage * postsPerPage
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

  // Handle page click from ReactPaginate
  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  return (
    <div className="container">
      <h1 className="my-5">Blog Posts</h1>
      {loading ? <p>Loading...</p> : <PostList posts={posts} />}
      <ReactPaginate
        previousLabel={"Previous"}
        nextLabel={"Next"}
        breakLabel={"..."}
        breakClassName={"break-me"}
        pageCount={Math.ceil(totalPosts / postsPerPage)} // Total number of pages
        marginPagesDisplayed={2} // How many pages to show at the beginning and end
        pageRangeDisplayed={3} // How many pages to show around the current page
        onPageChange={handlePageClick} // What happens when a page is clicked
        containerClassName={"pagination"} // CSS class for the pagination container
        activeClassName={"active"} // CSS class for the active page
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

export default GraphQLOffset;
