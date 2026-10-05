import Header from "./Header";
import { DimensionsProvider } from "./DimensionsContext";
import Career from "./Career";
import Tetris from "./tetris/Tetris";

function App() {
  return (
    <DimensionsProvider>
      <Header />
      <Career />
      <Tetris/>
    </DimensionsProvider>
  );
}

export default App;
