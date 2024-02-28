// import logo from './logo.svg';
import './App.css';
import Form from './components/FormCSV';
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
