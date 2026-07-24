import Chess from "./chess/Chess";
import { Header } from "./Header";
import { DimensionsProvider } from "./DimensionsContext";

function App() {
  return (
    <DimensionsProvider>
      <Header />
      <Chess />
    </DimensionsProvider>
  );
}

export default App;
