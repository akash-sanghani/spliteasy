import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { getAccessTokenFromLambda, getGroupsFromLambda } from "./api/backend";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accessToken: null,
      groupList: [], // store groups here
    };
  }

  componentDidMount() {
    const code = new URLSearchParams(window.location.search).get("code");

    if (code) {
      this.exchangeCodeForToken(code);
    } else {
      const saved = localStorage.getItem("sw_token");
      if (saved) {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        const ageMs = now - parsed.timestamp;
        const oneHourMs = 60 * 60 * 1000;

        if (ageMs < oneHourMs) {
          this.setState({ accessToken: parsed.access_token }, () => {
            this.getGroups(); // fetch groups once token is valid
          });
        } else {
          localStorage.removeItem("sw_token");
        }
      }
    }
  }

  async exchangeCodeForToken(code) {
    const res = await getAccessTokenFromLambda(code);
    if (res.access_token) {
      const tokenData = {
        access_token: res.access_token,
        timestamp: Date.now(),
      };
      localStorage.setItem("sw_token", JSON.stringify(tokenData));
      this.setState({ accessToken: res.access_token }, () => {
        this.getGroups(); // fetch groups after login
      });
      window.history.replaceState({}, "", "/");
    }
  }

  handleLogin = () => {
    const client_id = "TcCO3ZTFoYycyErpOjY4x9yTG8YpiBZc666AYUy6";
    const redirect_uri = "http://localhost:5173";
    const authUrl = `https://secure.splitwise.com/oauth/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=read,write`;
    window.location.href = authUrl;
  };

  getGroups = async () => {
    const { accessToken } = this.state;
    if (!accessToken) return;
    const res = await getGroupsFromLambda(accessToken);
    if (res.groups) {
      this.setState({ groupList: res.groups });
    }
  };

  renderGroups() {
    const { groupList } = this.state;
    if (!groupList || groupList.length === 0) {
      return <div>No groups found.</div>;
    }

    return groupList.map((group, index) => (
      <div
        key={group.id || index}
        style={{
          backgroundColor: "#1f1f1f",
          color: "#e0e0e0",
          padding: "10px",
          marginBottom: "8px",
          borderRadius: "4px",
        }}
      >
        <strong>{group.name}</strong>
      </div>
    ));
  }

  render() {
    const { accessToken } = this.state;

    return (
      <div>
        <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
          <Container>
            <Navbar.Brand href="#">SplitEasy</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                {!accessToken ? (
                  <Nav.Link onClick={this.handleLogin}>
                    Login with Splitwise
                  </Nav.Link>
                ) : (
                  <Navbar.Text>
                    Token:{" "}
                    <span style={{ fontWeight: "bold" }}>{accessToken}</span>
                  </Navbar.Text>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        <div style={{ marginTop: "80px", padding: "1rem" }}>
          <h3>Your Groups</h3>
          {this.renderGroups()}
        </div>
      </div>
    );
  }
}

export default App;
