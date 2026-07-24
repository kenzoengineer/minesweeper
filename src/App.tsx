import Header from "./Header";
import { DimensionsProvider } from "./DimensionsContext";
import Career from "./Career";

function App() {
  return (
    <DimensionsProvider>
      <Header />
      <Career />
    </DimensionsProvider>
  );
}

export default App;
