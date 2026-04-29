import { ConvexProvider } from "convex/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { convex } from "./lib/convexClient";
import Landing from "./pages/Landing";
import Start from "./pages/Start";
import Interview from "./pages/Interview";
import Evidence from "./pages/Evidence";
import References from "./pages/References";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import RefInterview from "./pages/RefInterview";

const App = () => {
  return (
    <ConvexProvider client={convex}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/start" element={<Start />} />
          <Route path="/interview/:profileId" element={<Interview />} />
          <Route path="/evidence/:profileId" element={<Evidence />} />
          <Route path="/references/:profileId" element={<References />} />
          <Route path="/dashboard/:profileId" element={<Dashboard />} />
          <Route path="/profile/:shareToken" element={<Profile />} />
          <Route path="/search" element={<Search />} />
          <Route path="/ref/:inviteToken" element={<RefInterview />} />
        </Routes>
      </BrowserRouter>
    </ConvexProvider>
  );
};

export default App;
