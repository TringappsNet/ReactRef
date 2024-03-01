import './App.css';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import AppRouter from './Router/AppRouter';
function App() {
  return (
    <Provider store={store}>

    <div className="App">
      
      <AppRouter />
    </div>
     </Provider>

  );
}

export default App;
