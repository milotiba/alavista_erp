import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import StorageManager from "./StorageManager";
import Validators from "./Validators";
import Dashboard from "./Dashboard";
import Productos from "./Productos";
import Inventario from "./Inventario";
import PVP from "./PVP";
import Gastos from "./Gastos";
import Bodegas from "./Bodegas";
import Traslados from "./Traslados";
import Usuarios from "./Usuarios";
import Logs from "./Logs";
import Login from "./Login";

const App = () => {
  useEffect(() => {
    // Check if user is authenticated
    const user = localStorage.getItem("user");
    if (!user) {
      // Redirect to login if not authenticated
      window.location.href = "/login";
    }
  }, []);

  return (
    <Router>
      <Switch>
        <Route path="/" exact component={Dashboard} />
        <Route path="/productos" component={Productos} />
        <Route path="/inventario" component={Inventario} />
        <Route path="/pvp" component={PVP} />
        <Route path="/gastos" component={Gastos} />
        <Route path="/bodegas" component={Bodegas} />
        <Route path="/traslados" component={Traslados} />
        <Route path="/usuarios" component={Usuarios} />
        <Route path="/logs" component={Logs} />
        <Route path="/login" component={Login} />
      </Switch>
    </Router>
  );
};

export default App;