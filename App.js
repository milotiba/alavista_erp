import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, styles, formatCurrency } from './shared/styles';
import { load, save, generarID, formatInputCurrency, parseCurrency, useMediaQuery } from './shared/utils';
import { INITIAL_FORM } from './shared/constants';
import Login from './shared/components/Login';
import ModalConfirmacion from './shared/components/ModalConfirmacion';
import logo from './img/logo-alv.png';
import logoMini from './img/logo-mini.png'; // <--- AQUÍ SE IMPORTA TU NUEVO LOGO MINI

// ===== IMPORTAR TODOS LOS MÓDULOS =====
import Dashboard from './modules/dashboard';
import Productos from './modules/inventario/ProductosView';
import Inventario from './modules/inventario/InventarioView';
import EditarProducto from './modules/inventario/components/EditarProducto';
import PVP from './modules/pvp/PvPView';
import Gastos from './modules/gastos/GastosView';
import GestionBodegas from './modules/bodegas/BodegasView';
import MatrizInventario from './modules/bodegas/MatrizInventarioView';
import Traslados from './modules/bodegas/TrasladosView';
import ConfiguracionML from './modules/integraciones/mercadolibre/MLConfigView';
import PublicacionesML from './modules/integraciones/mercadolibre/MLPublicacionesView';
import UsuariosManager from './modules/usuarios/UsuariosView';
import Logs from './modules/configuracion/LogsView';
import VentasView from './modules/ventas/VentasView';
import ClientesView from './modules/ventas/ClientesView';
import MarketingView from './modules/ventas/MarketingView';

// ===== COMPONENTE PRINCIPAL =====
export default function App() {
  const [user, setUser] = useState(() => load('user', null));
  const [usuarios, setUsuarios] = useState(() => load('usuarios', [
    { id: 1, usuario: 'admin', clave: '1234', rol: 'Administrador', nombre: 'Administrador', apellido: 'Sistema' }
  ]));
  const [productos, setProductos] = useState(() => load('productos', []));
  const [gastos, setGastos] = useState(() => load('gastos', []));
  const [ventas, setVentas] = useState(() => load('ventas', []));
  
  const [seccion, setSeccion] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [logs, setLogs] = useState(() => load('logs', []));

  const [marcas, setMarcas] = useState(() => load('marcas', ['HP', 'HyperX', 'Redragon', 'VSG', 'ADATA', 'ARGOM', 'Kingston', 'Logitech', 'Asus']));
  const [categorias, setCategorias] = useState(() => load('categorias', ['Audífonos', 'Mouse', 'Teclados', 'Monitores', 'Keycaps', 'Power Bank', 'Fuente de poder', 'Ventiladores', 'Sillas']));
  const [colores, setColores] = useState(() => load('colores', ["Negro", "Blanco", "Rojo", "Azul", "Verde", "Amarillo", "Gris", "Rosado", "Morado", "Naranja"]));

  const [bodegas, setBodegas] = useState(() => load('bodegas', [
    { id: 'BOD-001', nombre: 'PRINCIPAL', tipo: 'FÍSICA', descripcion: 'Bodega principal', estado: 'activa' },
    { id: 'BOD-002', nombre: 'PUNTO_VENTA', tipo: 'FÍSICA', descripcion: 'Punto de venta', estado: 'activa' },
    { id: 'BOD-003', nombre: 'MERCADOLIBRE', tipo: 'DIGITAL', descripcion: 'Marketplace MercadoLibre', estado: 'activa' },
    { id: 'BOD-004', nombre: 'FALABELLA', tipo: 'DIGITAL', descripcion: 'Marketplace Falabella', estado: 'activa' },
    { id: 'BOD-005', nombre: 'WOOCOMMERCE', tipo: 'DIGITAL', descripcion: 'Tienda WooCommerce', estado: 'activa' },
    { id: 'BOD-006', nombre: 'RESERVADOS', tipo: 'ESPECIAL', descripcion: 'Productos reservados', estado: 'activa' }
  ]));
  const [stockBodegas, setStockBodegas] = useState(() => load('stockBodegas', []));
  const [traslados, setTraslados] = useState(() => load('traslados', []));

  const [mlConfig, setMlConfig] = useState(() => load('mlConfig', {
    clientId: '', clientSecret: '', code: '', accessToken: '', refreshToken: '', redirectUri: 'https://localhost', expiresIn: null, tokenObtainedAt: null, userInfo: null
  }));

  const [expandedMenu, setExpandedMenu] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [alert, setAlert] = useState(null);
  const [productoEditar, setProductoEditar] = useState(null);
  const [modalGasto, setModalGasto] = useState(false);
  const [modalRecarga, setModalRecarga] = useState(false);
  const [parentHover, setParentHover] = useState(null);
  const [modalConfirm, setModalConfirm] = useState({ isOpen: false, titulo: '', mensaje: '', onConfirm: () => {}, tipo: 'warning' });
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [ventasVistas, setVentasVistas] = useState(() => load('ventasVistas', []));

  // ====== RESPONSIVE HOOKS ======
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');

  // ====== VARIABLE MAESTRA DE ANCHO DE SIDEBAR ======
  const sidebarWidth = isMobile ? 0 : (collapsed ? 80 : (isTablet ? 200 : 250));

  useEffect(() => { if (isMobile) setCollapsed(true); }, [isMobile]);
  
  const notify = useCallback((m, tipo = 'info') => {
    setAlert({ mensaje: m, tipo });
    setTimeout(() => setAlert(null), 3000);
  }, []);
  
  const showConfirm = (titulo, mensaje, onConfirm, tipo = 'warning') => {
    setModalConfirm({ isOpen: true, titulo, mensaje, onConfirm, tipo });
  };

  // ====== FUNCIÓN DE RECARGA SUAVE (No pierde pantalla completa) ======
  const handleSoftReload = useCallback(() => {
    setProductos(load('productos', []));
    setGastos(load('gastos', []));
    setVentas(load('ventas', []));
    setStockBodegas(load('stockBodegas', []));
    setTraslados(load('traslados', []));
    setBodegas(load('bodegas', [
      { id: 'BOD-001', nombre: 'PRINCIPAL', tipo: 'FÍSICA', descripcion: 'Bodega principal', estado: 'activa' },
      { id: 'BOD-002', nombre: 'PUNTO_VENTA', tipo: 'FÍSICA', descripcion: 'Punto de venta', estado: 'activa' },
      { id: 'BOD-003', nombre: 'MERCADOLIBRE', tipo: 'DIGITAL', descripcion: 'Marketplace MercadoLibre', estado: 'activa' },
      { id: 'BOD-004', nombre: 'FALABELLA', tipo: 'DIGITAL', descripcion: 'Marketplace Falabella', estado: 'activa' },
      { id: 'BOD-005', nombre: 'WOOCOMMERCE', tipo: 'DIGITAL', descripcion: 'Tienda WooCommerce', estado: 'activa' },
      { id: 'BOD-006', nombre: 'RESERVADOS', tipo: 'ESPECIAL', descripcion: 'Productos reservados', estado: 'activa' }
    ]));
    notify('🔄 Datos sincronizados y actualizados', 'success');
  }, [notify]);

  useEffect(() => { save('productos', productos); }, [productos]);
  useEffect(() => { save('usuarios', usuarios); }, [usuarios]);
  useEffect(() => { save('logs', logs); }, [logs]);
  useEffect(() => { save('gastos', gastos); }, [gastos]);
  useEffect(() => { save('ventas', ventas); }, [ventas]);
  useEffect(() => { save('marcas', marcas); }, [marcas]);
  useEffect(() => { save('categorias', categorias); }, [categorias]);
  useEffect(() => { save('colores', colores); }, [colores]);
  useEffect(() => { save('bodegas', bodegas); }, [bodegas]);
  useEffect(() => { save('stockBodegas', stockBodegas); }, [stockBodegas]);
  useEffect(() => { save('traslados', traslados); }, [traslados]);
  useEffect(() => { save('mlConfig', mlConfig); }, [mlConfig]);
  useEffect(() => { save('ventasVistas', ventasVistas); }, [ventasVistas]);

  const registrarLog = useCallback((accion) => {
    setLogs(prev => [{ id: Date.now(), usuario: user?.u || "desconocido", accion, fecha: new Date().toLocaleString("es-CO") }, ...prev]);
  }, [user]);
  
  const marcarVentasComoVistas = useCallback(() => {
    const nuevasVistas = ventas.map(v => v.id);
    setVentasVistas(nuevasVistas);
  }, [ventas]);
  
  useEffect(() => {
    const handleClickOutside = () => {
      if (showNotifications) setShowNotifications(false);
      if (showUserMenu) setShowUserMenu(false);
    };
    
    if (showNotifications || showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showNotifications, showUserMenu]);

  const login = useCallback((u, p) => {
    const usuarioEncontrado = usuarios.find(usr => usr.usuario === u && usr.clave === p);
    if (usuarioEncontrado) {
      const userData = { u: usuarioEncontrado.usuario, rol: usuarioEncontrado.rol, nombre: usuarioEncontrado.nombre };
      setUser(userData);
      save('user', userData);
      registrarLog(`Inició sesión`);
      return true;
    }
    return false;
  }, [usuarios, registrarLog]);

  const logout = useCallback(() => {
    registrarLog(`Cerró sesión`);
    setUser(null);
    localStorage.removeItem('user');
  }, [registrarLog]);

  const validarProducto = useCallback((formData) => {
    if (!formData.nombre?.trim()) { notify('El nombre es obligatorio', 'error'); return false; }
    if (!formData.sku?.trim()) { notify('El SKU fabricante es obligatorio', 'error'); return false; }
    if (formData.costo && Number(formData.costo) < 0) { notify('Costo inválido', 'error'); return false; }
    const duplicado = productos.find(p => p.sku === formData.sku && p.skuinterno !== formData.skuinterno);
    if (duplicado) { notify('Ya existe un producto con ese SKU', 'error'); return false; }
    return true;
  }, [notify, productos]);

  const agregar = useCallback(() => {
    if (!validarProducto(form)) return;
    const nuevoSku = generarID();
    const fotosNormalizadas = form.imagenes.map((url, i) => ({ id: Date.now() + i, url, nombre: 'img_inicial' }));

    setProductos(prev => [
      ...prev,
      { ...form, skuinterno: nuevoSku, costo: Number(form.costo) || 0, cantidad: Number(form.cantidad) || 0, nombre: form.nombre.trim(), sku: form.sku.trim(), fotos: fotosNormalizadas }
    ]);
    registrarLog(`Creó producto "${form.nombre}"`);
    notify('✓ Producto guardado', 'success');
    setForm(INITIAL_FORM);
  }, [form, notify, validarProducto, registrarLog]);

  const actualizarProducto = useCallback((productoActualizado) => {
    setProductos(prev => prev.map(p => p.skuinterno === productoActualizado.skuinterno ? productoActualizado : p));
    registrarLog(`Actualizó producto "${productoActualizado.nombre}"`);
    notify('✓ Producto actualizado', 'success');
    setSeccion('inventario');
    setProductoEditar(null);
  }, [notify, registrarLog]);

  const eliminar = useCallback((sku, nombre) => {
    if (window.confirm(`¿Eliminar "${nombre}"? Esta acción no se deshace.`)) {
      setProductos(prev => prev.filter(p => p.sku !== sku));
      registrarLog(`Eliminó producto "${nombre}"`);
      notify('✓ Producto eliminado', 'success');
    }
  }, [notify, registrarLog]);

  const agregarMasivo = useCallback((nuevosProductos) => {
    setProductos(prev => [...prev, ...nuevosProductos]);
    registrarLog(`Importó ${nuevosProductos.length} productos masivamente`);
    notify(`✅ ${nuevosProductos.length} productos importados exitosamente`, 'success');
  }, [registrarLog, notify]);

  const registrarMovimientoCaja = useCallback((movimiento) => {
    setGastos(prev => [movimiento, ...prev]);
    const accion = movimiento.tipo === 'INGRESO' ? 'Recargó Caja Menor' : 'Registró Gasto';
    registrarLog(`${accion}: ${movimiento.descripcion} (${movimiento.monto})`);
    notify(movimiento.tipo === 'INGRESO' ? '✓ Dinero ingresado' : '✓ Gasto registrado', 'success');
  }, [registrarLog, notify]);

  const eliminarMovimiento = useCallback((id, tipo) => {
    if(window.confirm('¿Eliminar este registro del histórico?')) {
      setGastos(prev => prev.filter(g => g.id !== id));
      registrarLog(`Eliminó registro de caja (${tipo || 'Gasto'})`);
      notify('✓ Registro eliminado', 'success');
    }
  }, [registrarLog, notify]);

  const crudUsuario = {
    crear: (nuevo) => {
      if (!nuevo.usuario || !nuevo.clave) return notify('Faltan datos', 'error');
      if (usuarios.find(u => u.usuario === nuevo.usuario)) return notify('Usuario ya existe', 'error');
      setUsuarios(prev => [...prev, { ...nuevo, id: Date.now() }]);
      registrarLog(`Creó usuario: ${nuevo.usuario}`);
      notify('✓ Usuario creado', 'success');
      return true;
    },
    eliminar: (id, nombre) => {
      if (window.confirm(`¿Eliminar usuario "${nombre}"?`)) {
        setUsuarios(prev => prev.filter(u => u.id !== id));
        registrarLog(`Eliminó usuario: ${nombre}`);
        notify('✓ Usuario eliminado', 'success');
      }
    },
    actualizar: (editado) => {
      setUsuarios(prev => prev.map(u => u.id === editado.id ? editado : u));
      registrarLog(`Actualizó usuario: ${editado.usuario}`);
      notify('✓ Usuario actualizado', 'success');
      return true;
    }
  };

  const crudBodegas = {
    crear: (data) => {
      if (!data.nombre?.trim()) { notify('El nombre es obligatorio', 'error'); return false; }
      if (bodegas.some(b => b.nombre.toUpperCase() === data.nombre.toUpperCase())) { notify('Ya existe una bodega con ese nombre', 'error'); return false; }
      const nueva = { ...data, id: generarID(), estado: 'activa' };
      setBodegas(prev => [...prev, nueva]);
      registrarLog(`Bodega creada: ${data.nombre}`);
      notify('✓ Bodega creada exitosamente', 'success');
      return true;
    },
    actualizar: (data) => {
      setBodegas(prev => prev.map(b => b.id === data.id ? data : b));
      registrarLog(`Bodega actualizada: ${data.nombre}`);
      notify('✓ Bodega actualizada', 'success');
      return true;
    },
    eliminar: (id, nombre) => {
      const tieneStock = stockBodegas.some(s => s.bodega === id && s.cantidad > 0);
      if (tieneStock) { notify('No se puede eliminar una bodega con stock', 'error'); return; }
      if (window.confirm(`¿Eliminar bodega: ${nombre}?`)) {
        setBodegas(prev => prev.filter(b => b.id !== id));
        setStockBodegas(prev => prev.filter(s => s.bodega !== id));
        registrarLog(`Bodega eliminada: ${nombre}`);
        notify('✓ Bodega eliminada', 'success');
      }
    }
  };

  const realizarTraslado = useCallback((data) => {
    const { origen, destino, skuinterno, cantidad, motivo } = data;
    if (origen === destino) { notify('El origen y destino deben ser diferentes', 'error'); return false; }
    const stockOrigen = stockBodegas.find(s => s.skuinterno === skuinterno && s.bodega === origen);
    if (!stockOrigen || stockOrigen.cantidad < cantidad) { notify('Stock insuficiente en bodega origen', 'error'); return false; }
    
    setStockBodegas(prev => {
      const nuevo = [...prev];
      const indexOrigen = nuevo.findIndex(s => s.skuinterno === skuinterno && s.bodega === origen);
      if (indexOrigen !== -1) nuevo[indexOrigen] = { ...nuevo[indexOrigen], cantidad: nuevo[indexOrigen].cantidad - cantidad };
      
      const indexDestino = nuevo.findIndex(s => s.skuinterno === skuinterno && s.bodega === destino);
      if (indexDestino !== -1) nuevo[indexDestino] = { ...nuevo[indexDestino], cantidad: nuevo[indexDestino].cantidad + cantidad };
      else nuevo.push({ skuinterno, bodega: destino, cantidad });
      
      return nuevo;
    });

    const traslado = { id: generarID(), origen, destino, skuinterno, cantidad, usuario: user?.usuario || 'Desconocido', fecha: new Date().toISOString(), motivo: motivo || 'Sin motivo' };
    setTraslados(prev => [traslado, ...prev]);
    const producto = productos.find(p => p.skuinterno === skuinterno);
    const bodegaOrigen = bodegas.find(b => b.id === origen);
    const bodegaDestino = bodegas.find(b => b.id === destino);
    registrarLog(`Trasladó ${cantidad} unidades de ${producto?.nombre || skuinterno} de ${bodegaOrigen?.nombre} a ${bodegaDestino?.nombre}`);
    notify('✓ Traslado realizado exitosamente', 'success');
    return true;
  }, [stockBodegas, bodegas, productos, user, notify, registrarLog]);

  const registrarVenta = useCallback((nuevaVenta) => {
    const idVenta = `VT-${generarID()}`;
    const ventaGuardar = { ...nuevaVenta, id: idVenta };
    
    setVentas(prev => [ventaGuardar, ...prev]);

    setProductos(prev => prev.map(p => {
      const itemVendido = nuevaVenta.items.find(i => i.idProducto === p.skuinterno);
      if (itemVendido) {
        return { ...p, cantidad: Math.max(0, Number(p.cantidad) - Number(itemVendido.cantidad)) };
      }
      return p;
    }));

    setStockBodegas(prev => {
      let nuevoStock = [...prev];
      nuevaVenta.items.forEach(item => {
        let faltante = Number(item.cantidad);
        for(let i = 0; i < nuevoStock.length; i++) {
          if(faltante <= 0) break;
          if(nuevoStock[i].skuinterno === item.idProducto && nuevoStock[i].cantidad > 0) {
            if(nuevoStock[i].cantidad >= faltante) {
               nuevoStock[i].cantidad -= faltante;
               faltante = 0;
            } else {
               faltante -= nuevoStock[i].cantidad;
               nuevoStock[i].cantidad = 0;
            }
          }
        }
      });
      return nuevoStock;
    });

    if (nuevaVenta.canal === 'POS') {
      const nuevoIngreso = {
        id: generarID(),
        fecha: new Date().toISOString(),
        tipo: 'INGRESO',
        categoria: 'Venta POS',
        descripcion: `Venta Mostrador ${idVenta} - ${nuevaVenta.cliente?.nombre || 'Mostrador'}`,
        monto: nuevaVenta.total
      };
      setGastos(prev => [nuevoIngreso, ...prev]);
    }

    registrarLog(`Registró nueva venta: ${idVenta} por ${formatCurrency(nuevaVenta.total)}`);
    notify('✓ Venta registrada y descontada del inventario', 'success');
  }, [notify, registrarLog]);

  const actualizarVenta = useCallback((ventaId, cambios) => {
    setVentas(prev => prev.map(v => 
      v.id === ventaId ? { ...v, ...cambios } : v
    ));
    if (cambios.estadoFacturacion === 'FACTURADO') {
      registrarLog(`Facturó venta ${ventaId} con número ${cambios.numeroFactura}`);
    }
  }, [registrarLog]);

  useEffect(() => {
    productos.forEach(p => {
      const tieneStock = stockBodegas.some(s => s.skuinterno === p.skuinterno);
      if (!tieneStock && p.cantidad > 0) {
        const bodegaPrincipal = bodegas.find(b => b.nombre === 'PRINCIPAL');
        if (bodegaPrincipal) {
          setStockBodegas(prev => {
            const existe = prev.some(s => s.skuinterno === p.skuinterno && s.bodega === bodegaPrincipal.id);
            if (!existe) return [...prev, { skuinterno: p.skuinterno, bodega: bodegaPrincipal.id, cantidad: Number(p.cantidad) || 0 }];
            return prev;
          });
        }
      }
    });
  }, [productos.length, bodegas, stockBodegas]);

  if (!user) return <Login login={login} isMobile={isMobile} />;

  const handleMenuClick = (sec) => {
    setSeccion(sec);
    if (isMobile) setCollapsed(true);
  };

  return (
    <div style={styles.layout(isMobile)}>
      {/* TOPBAR */}
      <TopBar 
        user={user} seccion={seccion} ventas={ventas} ventasVistas={ventasVistas} showNotifications={showNotifications} setShowNotifications={setShowNotifications} showUserMenu={showUserMenu} setShowUserMenu={setShowUserMenu} logout={logout} setSeccion={setSeccion} marcarVentasComoVistas={marcarVentasComoVistas} isMobile={isMobile} isTablet={isTablet} collapsed={collapsed} sidebarWidth={sidebarWidth} onSoftReload={handleSoftReload}
      />
      
      {isMobile && (
        <button onClick={() => setCollapsed(!collapsed)} style={{ position: 'fixed', top: 20, left: 20, zIndex: 1001, background: colors.azul, color: '#fff', border: 'none', borderRadius: 12, width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', fontSize: '1.5rem', fontWeight: 700 }}>
          {collapsed ? '☰' : '✕'}
        </button>
      )}
      {isMobile && !collapsed && (
        <div onClick={() => setCollapsed(true)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }} />
      )}
      
      {/* SIDEBAR CON POSICIONAMIENTO PEGAJOSO (STICKY/FIXED) */}
      <div style={{ 
        ...styles.sidebar(collapsed, isMobile), 
        position: isMobile ? 'fixed' : 'sticky', // Esto soluciona el problema de scroll
        top: 0,
        height: '100vh', // Altura del 100% de la ventana
        overflowY: 'auto', // Permite scroll independiente en el menú si es muy largo
        overflowX: 'hidden',
        width: isMobile ? undefined : sidebarWidth, 
        minWidth: isMobile ? undefined : sidebarWidth, 
        transition: 'all 0.3s ease',
        zIndex: 998
      }}>
        <div style={{ marginBottom: 20, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingTop: '16px' }}>
          {/* LÓGICA PARA CAMBIAR DE IMAGEN AL COLAPSAR */}
          <img 
            src={(collapsed && !isMobile) ? logoMini : logo} 
            alt="Logo Alavista" 
            style={{ 
              width: collapsed && !isMobile ? '45px' : '120px', 
              height: 'auto', 
              objectFit: 'contain', 
              transition: 'all 0.3s ease' 
            }} 
          />
        </div>
        
        {/* MENU PRINCIPAL */}
        <div style={{overflowY: 'auto', overflowX: 'hidden', paddingRight: 8 }}>
          <SidebarButton collapsed={collapsed} active={seccion === 'dashboard'} onClick={() => handleMenuClick('dashboard')} icon="dashboard" label="Dashboard" isMobile={isMobile} />
          <SidebarButton collapsed={collapsed} active={seccion === 'ventas'} onClick={() => handleMenuClick('ventas')} icon="cart" label="Ventas" isMobile={isMobile} />
          
          <div style={{ marginTop: 8 }}>
            <SidebarButton collapsed={collapsed} active={seccion === 'clientes' || seccion === 'marketing'} onClick={() => setExpandedMenu(expandedMenu === 'crm_group' ? null : 'crm_group')} icon="users" label="CRM" isMobile={isMobile} extraIcon={<motion.span animate={{ rotate: expandedMenu === 'crm_group' ? 180 : 0 }} style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>▼</motion.span>} />
            <AnimatePresence>
              {expandedMenu === 'crm_group' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                  <div style={{ paddingLeft: collapsed && !isMobile ? 0 : 12 }}>
                    <SidebarButton collapsed={collapsed} active={seccion === 'clientes'} onClick={() => handleMenuClick('clientes')} icon="list" label="Base de Clientes" isMobile={isMobile} isSubItem={true} />
                    <SidebarButton collapsed={collapsed} active={seccion === 'marketing'} onClick={() => handleMenuClick('marketing')} icon="megaphone" label="Marketing Ads" isMobile={isMobile} isSubItem={true} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div style={{ marginTop: 8 }}>
            <SidebarButton collapsed={collapsed} active={seccion === 'inventario' || seccion === 'productos'} onClick={() => setExpandedMenu(expandedMenu === 'inventario_group' ? null : 'inventario_group')} icon="package" label="Inventario" isMobile={isMobile} extraIcon={<motion.span animate={{ rotate: expandedMenu === 'inventario_group' ? 180 : 0 }} style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>▼</motion.span>} />
            <AnimatePresence>
              {expandedMenu === 'inventario_group' && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                  <div style={{ paddingLeft: collapsed && !isMobile ? 0 : 12 }}>
                    <SidebarButton collapsed={collapsed} active={seccion === 'productos'} onClick={() => handleMenuClick('productos')} icon="plusCircle" label="Nuevo Producto" isMobile={isMobile} isSubItem={true} />
                    <SidebarButton collapsed={collapsed} active={seccion === 'inventario'} onClick={() => handleMenuClick('inventario')} icon="grid" label="Inv General" isMobile={isMobile} isSubItem={true} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div onMouseEnter={() => setParentHover('gastos')} onMouseLeave={() => setParentHover(null)}>
            <div style={{ transform: parentHover === 'gastos' ? 'translateX(4px)' : 'translateX(0)', transition: 'all 0.3s ease' }}>
              <SidebarButton collapsed={collapsed} active={seccion === 'gastos'} onClick={() => handleMenuClick('gastos')} icon="wallet" label="Gastos / Caja" isMobile={isMobile} />
            </div>
          </div>
          
          <SidebarButton collapsed={collapsed} active={seccion === 'pvp'} onClick={() => handleMenuClick('pvp')} icon="tag" label="PVP" isMobile={isMobile} />
          
          <div>
            <div onMouseEnter={() => setParentHover('bodegas')} onMouseLeave={() => setParentHover(null)} style={{ transform: parentHover === 'bodegas' ? 'translateX(4px)' : 'translateX(0)', transition: 'all 0.3s ease' }}>
              <SidebarButton collapsed={collapsed} active={seccion === 'bodegas' || seccion === 'matriz-bodegas' || seccion === 'traslados'} onClick={() => setExpandedMenu(expandedMenu === 'bodegas' ? null : 'bodegas')} icon="warehouse" label="Bodegas" isMobile={isMobile} extraIcon={<motion.span animate={{ rotate: expandedMenu === 'bodegas' ? 180 : 0 }} style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>▼</motion.span>} />
            </div>
            <AnimatePresence>
              {expandedMenu === 'bodegas' && !collapsed && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                  <div style={{ paddingLeft: isMobile ? 12 : 16, marginTop: 4 }}>
                    <SidebarButton collapsed={collapsed} active={seccion === 'bodegas'} onClick={() => handleMenuClick('bodegas')} icon="layers" label="Gestión Bodegas" isMobile={isMobile} isSubItem={true} />
                    <SidebarButton collapsed={collapsed} active={seccion === 'matriz-bodegas'} onClick={() => handleMenuClick('matriz-bodegas')} icon="dashboard" label="Matriz Inventario" isMobile={isMobile} isSubItem={true} />
                    <SidebarButton collapsed={collapsed} active={seccion === 'traslados'} onClick={() => handleMenuClick('traslados')} icon="truck" label="Traslados" isMobile={isMobile} isSubItem={true} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div>
            <div onMouseEnter={() => setParentHover('mercadolibre')} onMouseLeave={() => setParentHover(null)} style={{ transform: parentHover === 'mercadolibre' ? 'translateX(4px)' : 'translateX(0)', transition: 'all 0.3s ease' }}>
              <SidebarButton collapsed={collapsed} active={seccion === 'ml-config' || seccion === 'ml-publicaciones'} onClick={() => setExpandedMenu(expandedMenu === 'mercadolibre' ? null : 'mercadolibre')} icon="shoppingBag" label="MercadoLibre" isMobile={isMobile} extraIcon={<motion.span animate={{ rotate: expandedMenu === 'mercadolibre' ? 180 : 0 }} style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>▼</motion.span>} />
            </div>
            <AnimatePresence>
              {expandedMenu === 'mercadolibre' && !collapsed && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                  <div style={{ paddingLeft: isMobile ? 12 : 16, marginTop: 4 }}>
                    <SidebarButton collapsed={collapsed} active={seccion === 'ml-config'} onClick={() => handleMenuClick('ml-config')} icon="settings" label="Configuración" isMobile={isMobile} isSubItem={true} />
                    <SidebarButton collapsed={collapsed} active={seccion === 'ml-publicaciones'} onClick={() => handleMenuClick('ml-publicaciones')} icon="uploadCloud" label="Publicaciones" isMobile={isMobile} isSubItem={true} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div style={{ marginTop: 16, paddingTop: 16, paddingBottom: 32, borderTop: `1px solid rgba(255,255,255,0.1)` }}>
          {!isMobile && <SidebarButton collapsed={collapsed} onClick={() => setCollapsed(!collapsed)} icon={collapsed ? "arrowRight" : "arrowLeft"} label="Minimizar" isMobile={isMobile} />}
        </div>
      </div>

      {/* ÁREA DE CONTENIDO */}
      <div style={{ ...styles.content(isMobile), paddingTop: '80px', flex: 1, width: '100%', transition: 'all 0.3s ease' }}>
        <AnimatePresence>
          {alert && (
            <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20 }}
              style={{ position: 'fixed', top: 80, right: 20, background: alert.tipo === 'error' ? colors.rojo : (alert.tipo === 'success' ? colors.verde : colors.naranja), color: '#fff', padding: '16px 24px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', fontWeight: 600, zIndex: 9999 }}
            >
              {alert.mensaje}
            </motion.div>
          )}
        </AnimatePresence>
        
        {seccion === 'dashboard' && <Dashboard productos={productos} gastos={gastos} ventas={ventas} isMobile={isMobile} />}
        {seccion === 'ventas' && <VentasView ventas={ventas} productos={productos} registrarVenta={registrarVenta} actualizarVenta={actualizarVenta} isMobile={isMobile} />}
        {seccion === 'clientes' && <ClientesView ventas={ventas} isMobile={isMobile} />}
        {seccion === 'marketing' && <MarketingView ventas={ventas} isMobile={isMobile} />}
        {seccion === 'productos' && <Productos form={form} setForm={setForm} agregar={agregar} isMobile={isMobile} marcas={marcas} setMarcas={setMarcas} categorias={categorias} setCategorias={setCategorias} colores={colores} setColores={setColores} notify={notify} />}
        {seccion === 'inventario' && <Inventario productos={productos} eliminar={eliminar} agregarMasivo={agregarMasivo} notify={notify} irAEditar={(p) => { setProductoEditar(p); setSeccion('editar'); }} isMobile={isMobile} />}
        {seccion === 'pvp' && <PVP productos={productos} isMobile={isMobile} />}
        {seccion === 'gastos' && <Gastos gastos={gastos} ventas={ventas} registrarMovimientoCaja={registrarMovimientoCaja} eliminarMovimiento={eliminarMovimiento} user={user} isMobile={isMobile} modalGasto={modalGasto} setModalGasto={setModalGasto} modalRecarga={modalRecarga} setModalRecarga={setModalRecarga} />}
        {seccion === 'bodegas' && <GestionBodegas bodegas={bodegas} crud={crudBodegas} stockBodegas={stockBodegas} isMobile={isMobile} user={user} />}
        {seccion === 'matriz-bodegas' && <MatrizInventario productos={productos} bodegas={bodegas} stockBodegas={stockBodegas} isMobile={isMobile} />}
        {seccion === 'traslados' && <Traslados productos={productos} bodegas={bodegas} stockBodegas={stockBodegas} traslados={traslados} realizarTraslado={realizarTraslado} isMobile={isMobile} />}
        {seccion === 'ml-config' && <ConfiguracionML mlConfig={mlConfig} setMlConfig={setMlConfig} notify={notify} isMobile={isMobile} />}
        {seccion === 'ml-publicaciones' && <PublicacionesML productos={productos} mlConfig={mlConfig} stockBodegas={stockBodegas} bodegas={bodegas} notify={notify} registrarLog={registrarLog} isMobile={isMobile} />}
        {seccion === 'editar' && productoEditar && <EditarProducto producto={productoEditar} actualizar={actualizarProducto} cancelar={() => { setSeccion('inventario'); setProductoEditar(null); }} isMobile={isMobile} marcas={marcas} categorias={categorias} colores={colores} />}
        {seccion === 'usuarios' && <UsuariosManager usuarios={usuarios} crud={crudUsuario} user={user} isMobile={isMobile} />}
        {seccion === 'logs' && <Logs logs={logs} isMobile={isMobile} />}
        
        <ModalConfirmacion isOpen={modalConfirm.isOpen} onClose={() => setModalConfirm({ ...modalConfirm, isOpen: false })} onConfirm={modalConfirm.onConfirm} titulo={modalConfirm.titulo} mensaje={modalConfirm.mensaje} tipo={modalConfirm.tipo} isMobile={isMobile} />
      </div>
    </div>
  );
}

const TopBar = ({ user, seccion, ventas, ventasVistas, showNotifications, setShowNotifications, showUserMenu, setShowUserMenu, logout, setSeccion, marcarVentasComoVistas, isMobile, isTablet, collapsed, sidebarWidth, onSoftReload }) => {
  const ventasNoVistas = ventas.filter(v => !ventasVistas.includes(v.id));
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(err => console.log(err.message));
    else if (document.exitFullscreen) document.exitFullscreen();
  };

  const getIconoCanal = (canal) => {
    const iconos = { 'MERCADOLIBRE': '🛒', 'FALABELLA': '🏬', 'RAPPI': '🚀', 'PUNTO_VENTA': '🏪', 'WOOCOMMERCE': '🛍️', 'POS': '🏪' };
    return iconos[canal] || '📦';
  };
  
  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setShowUserMenu(false);
    if (!showNotifications && ventasNoVistas.length > 0) marcarVentasComoVistas();
  };
  
  return (
    <div style={{ position: 'fixed', top: 0, left: sidebarWidth, right: 0, height: '64px', background: 'linear-gradient(to bottom, #eef2f7 0%, #e2e8f0 100%)', borderBottom: '2px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 24px', zIndex: 1000, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'left 0.3s ease' }} onClick={(e) => e.stopPropagation()}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {!isMobile && (
          <>
            {/* NUEVO BOTÓN: RECARGA SUAVE */}
            <button onClick={onSoftReload} title="Sincronizar/Actualizar Datos" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = colors.claro} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.azul} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            </button>
            
            {/* BOTÓN PANTALLA COMPLETA */}
            <button onClick={toggleFullScreen} title={isFullscreen ? "Salir de Pantalla Completa" : "Pantalla Completa"} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = colors.claro} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              {isFullscreen ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.azul} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/></svg> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.azul} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>}
            </button>
          </>
        )}
        <div style={{ position: 'relative' }}>
          <button onClick={handleNotificationClick} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = colors.claro} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.azul} strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
            {ventasNoVistas.length > 0 && <div style={{ position: 'absolute', top: '4px', right: '4px', background: colors.rojo, color: 'white', borderRadius: '10px', minWidth: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, padding: '0 6px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>{ventasNoVistas.length > 99 ? '99+' : ventasNoVistas.length}</div>}
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '380px', maxWidth: '90vw', background: 'white', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', background: colors.claro }}><h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: colors.azul }}>Notificaciones de Ventas</h3><p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: colors.grisSuave }}>{ventas.length === 0 ? 'No hay ventas registradas' : `${ventas.length} ventas registradas`}</p></div>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {ventas.length === 0 ? (
                    <div style={{ padding: '32px 16px', textAlign: 'center', color: colors.grisSuave }}><div style={{ fontSize: '2rem', marginBottom: '8px' }}>📭</div><div style={{ fontSize: '0.9rem' }}>No hay ventas aún</div></div>
                  ) : (
                    ventas.slice(0, 10).map((venta) => (
                      <div key={venta.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background 0.2s', background: !ventasVistas.includes(venta.id) ? '#fff9e6' : 'transparent' }} onMouseEnter={(e) => e.currentTarget.style.background = colors.claro} onMouseLeave={(e) => e.currentTarget.style.background = !ventasVistas.includes(venta.id) ? '#fff9e6' : 'transparent'} onClick={() => { setSeccion('ventas'); setShowNotifications(false); }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                          <div style={{ fontSize: '1.5rem' }}>{getIconoCanal(venta.canal)}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}><span style={{ fontWeight: 600, fontSize: '0.9rem', color: colors.texto }}>Nueva venta en {venta.canal || 'Canal desconocido'}</span>{!ventasVistas.includes(venta.id) && <div style={{ width: '8px', height: '8px', background: colors.azul2, borderRadius: '50%' }} />}</div>
                            <div style={{ fontSize: '0.85rem', color: colors.grisSuave, marginBottom: 4 }}>{typeof venta.cliente === 'string' ? venta.cliente : (venta.cliente?.nombre || 'Cliente no especificado')}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontWeight: 700, color: colors.verde, fontSize: '0.9rem' }}>{formatCurrency(venta.total || 0)}</span><span style={{ fontSize: '0.75rem', color: colors.grisSuave }}>{new Date(venta.fecha).toLocaleString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {ventas.length > 0 && <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}><button onClick={() => { setSeccion('ventas'); setShowNotifications(false); }} style={{ background: 'transparent', border: 'none', color: colors.azul2, fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px' }}>Ver todas las ventas →</button></div>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div style={{ position: 'relative' }}>
          <button onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', gap: 8, borderRadius: '8px', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = colors.claro} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: `linear-gradient(135deg, ${colors.azul} 0%, ${colors.azul2} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>{(user.nombre || user.u || 'U').charAt(0).toUpperCase()}</div>
            {!isMobile && <div style={{ textAlign: 'left' }}><div style={{ fontSize: '0.85rem', fontWeight: 600, color: colors.texto }}>{user.nombre || user.u}</div><div style={{ fontSize: '0.75rem', color: colors.grisSuave }}>{user.rol || 'Usuario'}</div></div>}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.grisSuave} strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
          </button>
          
          <AnimatePresence>
            {showUserMenu && (
              <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '240px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}><div style={{ fontSize: '0.9rem', fontWeight: 600, color: colors.texto }}>{user.nombre || user.u}</div><div style={{ fontSize: '0.75rem', color: colors.grisSuave, marginTop: 2 }}>{user.rol || 'Usuario'}</div></div>
                {user.rol === 'Administrador' && (
                  <>
                    <button onClick={() => { setSeccion('usuarios'); setShowUserMenu(false); }} style={{ width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.9rem', color: colors.texto, transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = colors.claro} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>Gestión de Usuarios</button>
                    <button onClick={() => { setSeccion('logs'); setShowUserMenu(false); }} style={{ width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.9rem', color: colors.texto, transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = colors.claro} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>Logs de Actividad</button>
                    <div style={{ height: '1px', background: '#f3f4f6', margin: '4px 0' }} />
                  </>
                )}
                <button onClick={() => { setShowUserMenu(false); logout(); }} style={{ width: '100%', padding: '12px 16px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: '0.9rem', color: colors.rojo, transition: 'background 0.2s', fontWeight: 600 }} onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>Cerrar Sesión</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const SidebarButton = ({ collapsed, onClick, label, icon, active, isMobile, isSubItem, extraIcon }) => {
  const [hover, setHover] = useState(false);
  const icons = {
    dashboard: <path d="M3 3h7v7H3zM14 3h7v4h-7zM14 11h7v10h-7zM3 14h7v7H3z" />,
    cart: <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></>,
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    megaphone: <><polygon points="11 19 2 12 11 5 11 19" /><path d="M22 12A10 10 0 0 0 12 2v20a10 10 0 0 0 10-10z" /></>,
    package: <><line x1="16.5" y1="9.4" x2="7.5" y2="4.21" /><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>,
    list: <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>,
    plusCircle: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></>,
    wallet: <><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" /><path d="M4 6v12c0 1.1.9 2 2 2h14v-4" /><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" /></>,
    tag: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></>,
    warehouse: <><rect x="2" y="8" width="20" height="14" rx="2" /><path d="M6 8V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v4" /><line x1="6" y1="12" x2="6" y2="18" /><line x1="10" y1="12" x2="10" y2="18" /><line x1="14" y1="12" x2="14" y2="18" /><line x1="18" y1="12" x2="18" y2="18" /></>,
    layers: <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>,
    truck: <><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></>,
    shoppingBag: <><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
    uploadCloud: <><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /><polyline points="16 16 12 12 8 16" /></>,
    arrowLeft: <polyline points="15 18 9 12 15 6" />,
    arrowRight: <polyline points="9 18 15 12 9 6" />
  };

  // Lógica para el tamaño del icono: 
  // Siempre "22" si está colapsado, para evitar que se achiquen.
  const iconSize = (collapsed && !isMobile) ? "22" : (isSubItem ? "16" : "20");
  
  return (
    <button style={styles.btnMenu(collapsed, active, hover, isMobile, isSubItem)} onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      
      {/* EL SECRETO: flexShrink: 0 y minWidth previenen que Flexbox aplaste el icono */}
      <svg 
        width={iconSize} 
        height={iconSize} 
        style={{ flexShrink: 0, minWidth: `${iconSize}px`, minHeight: `${iconSize}px` }} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        {icons[icon]}
      </svg>
      
      {(!collapsed || isMobile) && (
        <><span style={{ fontSize: isSubItem ? '0.9rem' : '0.95rem' }}>{label}</span>{extraIcon}</>
      )}
    </button>
  );
};