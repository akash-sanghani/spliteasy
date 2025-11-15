import React from "react";
import { Navbar, Container, Nav, Button, Form } from "react-bootstrap";
import { getAccessTokenFromLambda, getGroupsFromLambda, getGroupInfoFromLambda } from "./api/backend";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      accessToken: null,
      groupList: [
        
      ],
      selectedGroup: null,
      walmartDump: "",
      itemizedExpenses: [],
      activeMembers: [],
    };
  }

  componentDidMount() {
    // When Splitwise redirects back, the URL will contain ?code=...
    const code = new URLSearchParams(window.location.search).get("code");

    if (code) {
      this.exchangeCodeForToken(code);
    } else {
      // If no code, check localStorage for a saved token
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
    try {
      const res = await getAccessTokenFromLambda(code); // <-- call your backend
      if (res.access_token) {
        const tokenData = {
          access_token: res.access_token,
          timestamp: Date.now(),
        };
        localStorage.setItem("sw_token", JSON.stringify(tokenData));
        this.setState({ accessToken: res.access_token });
        // Clean up the URL so ?code=... disappears
        window.history.replaceState({}, "", "/");
      }
    } catch (err) {
      console.error("Error fetching access token:", err);
    }
  }

  async getGroups() {
    const { accessToken } = this.state;
    try {
      const res = await getGroupsFromLambda(accessToken); // <-- call your backend
      if (res.groups) {
        this.setState({ groupList: res.groups });
      }
    } catch (err) {
      console.error("Error fetching groups:", err);
    }
  }

  // --- OAuth login flow (stubbed for demo) ---
  handleLogin = () => {
    const client_id = "TcCO3ZTFoYycyErpOjY4x9yTG8YpiBZc666AYUy6";
    const redirect_uri = "http://localhost:5173";
    const authUrl =
      `https://secure.splitwise.com/oauth/authorize` +
      `?response_type=code` +
      `&client_id=${encodeURIComponent(client_id)}` +
      `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
      `&scope=read,write`;

    window.location.assign(authUrl);
  };

  // --- Navigation ---
  backToGroups = () => {
    this.setState({
      selectedGroup: null,
      walmartDump: "",
      itemizedExpenses: [],
      activeMembers: [],
    });
  };

  // --- Text area handling ---
  handleDumpChange = (e) => {
    this.setState({ walmartDump: e.target.value });
  };

  // --- Member toggling ---
  toggleMember = (memberName) => {
    const { activeMembers } = this.state;
    if (activeMembers.includes(memberName)) {
      this.setState(
        { activeMembers: activeMembers.filter((m) => m !== memberName) },
        this.recalculateExpenses
      );
    } else {
      this.setState(
        { activeMembers: [...activeMembers, memberName] },
        this.recalculateExpenses
      );
    }
  };

  // --- Expense creation ---
  createExpense = () => {
    const { walmartDump, selectedGroup } = this.state;
    const members = selectedGroup?.members?.map((m) => m.first_namename) || [];
    this.setState({ activeMembers: members }); // default: all included

    if (walmartDump.trim()) {
      const lines = walmartDump.split("\n").filter((l) => l.trim());
      const parsed = lines.map((line) => {
        // Example format: "Milk 3.50"
        const parts = line.trim().split(" ");
        const item = parts.slice(0, -1).join(" ");
        const amount = parseFloat(parts[parts.length - 1]) || 0;
        return { item, amount };
      });
      this.setState({ itemizedExpenses: parsed }, this.recalculateExpenses);
    } else {
      // No dump → create empty rows
      this.setState(
        {
          itemizedExpenses: [{ item: "", amount: 0 }],
        },
        this.recalculateExpenses
      );
    }
  };

  // --- Recalculate distribution ---
  recalculateExpenses = () => {
    const { itemizedExpenses, activeMembers } = this.state;
    if (!activeMembers.length) {
      console.log("No active members selected.");
      return;
    }
    
    const updated = itemizedExpenses.map((row) => {
      const share = activeMembers.length
        ? (row.amount / activeMembers.length).toFixed(2)
        : 0;
      const distribution = {};
      activeMembers.forEach((m) => {
        distribution[m] = share;
      });
      return { ...row, distribution };
    });

    this.setState({ itemizedExpenses: updated });
  };

  // --- Render itemized table ---
  renderItemizedTable() {
    const { itemizedExpenses, activeMembers, selectedGroup } = this.state;
    if (!itemizedExpenses.length) return null;

    const allMembers = selectedGroup?.members?.map((m) => m.first_name) || [];

    return (
      <table
        style={{
          width: "100%",
          marginTop: "20px",
          borderCollapse: "collapse",
          backgroundColor: "#1f1f1f",
          color: "#e0e0e0",
        }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid #444", padding: "8px" }}>Item</th>
            <th style={{ border: "1px solid #444", padding: "8px" }}>Amount</th>
            {allMembers.map((m) => (
              <th
                key={m}
                onClick={() => this.toggleMember(m)}
                style={{
                  border: "1px solid #444",
                  padding: "8px",
                  cursor: "pointer",
                  backgroundColor: activeMembers.includes(m)
                    ? "#0077cc"
                    : "#444",
                }}
              >
                {m}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {itemizedExpenses.map((row, idx) => (
            <tr key={idx}>
              <td style={{ border: "1px solid #444", padding: "8px" }}>
                {row.item}
              </td>
              <td style={{ border: "1px solid #444", padding: "8px" }}>
                {row.amount}
              </td>
              {allMembers.map((m) => (
                <td style={{ border: "1px solid #444", padding: "8px" }}>
                  {row.distribution?.[m] || "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // --- Render group detail view ---
  renderGroupDetail() {
    const { selectedGroup, walmartDump } = this.state;
    if (!selectedGroup) return null;
    // console.log("Selected Group:", selectedGroup);

    return (
      <div style={{ marginTop: "80px", padding: "1rem" }}>
        <Button variant="secondary" onClick={this.backToGroups}>
          Groups
        </Button>

        <h3 style={{ marginTop: "20px" }}>{selectedGroup.name}</h3>
        <p>Members: {selectedGroup.members?.map((m) => m.first_name).join(", ")}</p>
        <p>
          Balances:{" "}
          {selectedGroup.members?.map((m, idx) => {
            const amt = m.balance[0].amount;
            const currency = m.balance[0].currency_code;
            const verb = amt < 0 ? "owes" : "gets back";
            const color = amt < 0 ? "red" : "green";

            return (
              <p key={idx} style={{ color }}>
                {m.first_name} {verb} {Math.abs(amt)} {currency}
              </p>
            );
          })}
        </p>

        <div style={{ display: "flex", marginTop: "20px" }}>
          <Form.Control
            as="textarea"
            rows={5}
            value={walmartDump}
            onChange={this.handleDumpChange}
            placeholder="Paste Walmart receipt dump here..."
            style={{ flex: 1, marginRight: "10px" }}
          />
          <Button variant="primary" onClick={this.createExpense}>
            Create Itemized Expense
          </Button>
        </div>

        {this.renderItemizedTable()}
      </div>
    );
  }

  // --- Render groups list ---
  renderGroups() {
    const { groupList } = this.state;
    return (
      <div style={{ marginTop: "80px", padding: "1rem" }}>
        <h3>Your Groups</h3>
        {groupList.map((group) => (
          <div
            key={group.id}
            onClick={() => this.setState({ selectedGroup: group })}
            style={{
              backgroundColor: "#1f1f1f",
              color: "#e0e0e0",
              padding: "10px",
              marginBottom: "8px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            <strong>{group.name}</strong>
          </div>
        ))}
      </div>
    );
  }

  render() {
    const { accessToken, selectedGroup } = this.state;

    return (
      <div>
        <Navbar bg="dark" variant="dark" expand="lg" fixed="top">
          <Container>
            <Navbar.Brand href="#">SplitEasy</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="ms-auto">
                {!accessToken ? (
                  <Button
                    variant="outline-light"
                    onClick={this.handleLogin}
                    style={{ cursor: "pointer" }}
                  >
                    Login with Splitwise
                  </Button>
                ) : (
                  <Navbar.Text>
                    Token: <span style={{ fontWeight: "bold" }}>{accessToken}</span>
                  </Navbar.Text>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {/* Main content below navbar */}
        {!selectedGroup && this.renderGroups()}
        {selectedGroup && this.renderGroupDetail()}
      </div>
    );
  }
}

export default App;
