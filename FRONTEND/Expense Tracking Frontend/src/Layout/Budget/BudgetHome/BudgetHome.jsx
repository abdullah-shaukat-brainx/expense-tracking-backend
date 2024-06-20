import React, { useEffect, useState } from "react";
import {
  Spinner,
  Form,
  Button,
  Container,
  Row,
  Col,
  Table,
} from "react-bootstrap";
import { useNavigate } from "react-router";
import BudgetItem from "../BudgetItem/BudgetItem";
import Pagination from "@mui/material/Pagination";
import { toast } from "react-toastify";
import { getBudgets } from "../../../Services/budgetServices";
import { useDebounce } from "../../../Utils";

function BudgetHome() {
  const navigate = useNavigate();
  const [spinner, setSpinner] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPagesCount, setTotalPagesCount] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Debounce the search query with 300ms delay
  const debouncedSearchQuery = useDebounce(searchQuery.trim(), 300);

  const updateRefresh = () => {
    setRefresh(!refresh);
  };

  const fetchBudgets = async (page, limit) => {
    setSpinner(true);
    try {
      const response = await getBudgets({
        currentPage: page,
        limit: limit,
        searchQuery: debouncedSearchQuery, // Use debounced search query
      });
      if (response?.data?.budgets) {
        setBudgets(response?.data?.budgets);
        setTotalPagesCount(parseInt(response?.data?.totalPages));
      } else {
        setBudgets([]);
      }
    } catch (error) {
      console.error("Error fetching budgets:", error);
      setBudgets([]);
    } finally {
      setSpinner(false);
    }
  };

  useEffect(() => {
    fetchBudgets(currentPage, limit);
  }, [refresh, currentPage, limit, debouncedSearchQuery]); // Include debouncedSearchQuery in dependencies

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleLimitChange = (e) => {
    setLimit(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <Container fluid className="mt-5">
      <Row className="justify-content-center mb-4">
        <Col xs={12} md={6}>
          <h2 className="text-center">
            Budgets for:{" "}
            {JSON.parse(localStorage.getItem("user_details"))?.name}
          </h2>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col xs={6} md={3} className="d-flex flex-row justify-content-center">
          <Form.Group controlId="search">
            <Form.Control
              type="text"
              placeholder="Search Budget amount here"
              onChange={handleChange}
            />
            <Button
              variant="success"
              className="mt-3"
              onClick={() => {
                navigate("/budget/create_budget");
              }}
            >
              Click me to add a new Budget
            </Button>
          </Form.Group>
        </Col>
      </Row>
      {budgets.length === 0 ? (
        <h2>No budgets to show.</h2>
      ) : (
        <>
          <Row className="mt-5">
            <Container>
              <div className="container budgets-card">
                {spinner && <Spinner animation="border" />}
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Amount</th>
                      <th>Controls</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgets.map((budget) => (
                      <BudgetItem
                        key={budget._id}
                        month={budget.month}
                        year={budget.year}
                        amount={budget.amount}
                        id={budget._id}
                        updateRefresh={updateRefresh}
                      />
                    ))}
                  </tbody>
                </Table>
              </div>
            </Container>
          </Row>
          <Container>
            <Row>
              <div className="pages mt-5 d-flex flex-row justify-content-center">
                <Col xs={6} md={6}>
                  <Pagination
                    color="primary"
                    count={totalPagesCount}
                    page={currentPage}
                    onChange={handlePageChange}
                    size="large"
                  />
                </Col>
                <Col xs={6} md={6}>
                  <div className="limit-selection">
                    Showing {limit} items per Page
                    <select
                      name="limit"
                      value={limit}
                      onChange={handleLimitChange}
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="15">15</option>
                    </select>
                  </div>
                </Col>
              </div>
            </Row>
          </Container>
        </>
      )}
    </Container>
  );
}

export default BudgetHome;
