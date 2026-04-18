import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Divider,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import CloseIcon from '@mui/icons-material/Close'
import { useStore } from '../../store/useStore'

const NAV_LINKS = [
  { label: 'Về chúng tôi', href: '/#about' },
  { label: 'Quy trình', href: '/#process' },
  { label: 'Hỏi đáp', href: '/#faq' },
  { label: 'Kiến thức', href: '/#knowledge' },
  { label: 'Liên hệ', href: '/#contact' },
]

export function Header() {
  const navigate = useNavigate()
  // const location = useLocation()
  const { user, isAuthenticated, logout } = useStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleUserMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)
  const handleUserMenuClose = () => setAnchorEl(null)

  const handleLogout = () => {
    logout()
    handleUserMenuClose()
    navigate('/')
  }

  const handleDashboard = () => {
    handleUserMenuClose()
    if (user?.role === 'donor') navigate('/donor/dashboard')
    else if (user?.role === 'hospital') navigate('/hospital/dashboard')
  }

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: 'white',
          borderBottom: '1px solid #f1f5f9',
          zIndex: 1100,
        }}
      >
        <Toolbar className="container mx-auto flex items-center justify-between px-4 py-1">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div className="flex items-center justify-center w-9 h-9 bg-red-600 rounded-lg shadow-md">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
                <path d="M12 2.4C9.3 6.1 6 9.5 6 13.5A6 6 0 1 0 18 13.5C18 9.5 14.7 6.1 12 2.4z" />
                <path d="M8.2 14.1a.9.9 0 1 1 1.6.8 2.6 2.6 0 0 0-.2 1 .9.9 0 1 1-1.8 0c0-.6.1-1.2.4-1.8z" fill="white" opacity="0.7" />
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold text-red-600 tracking-tight">BloodConnect</span>
              <span className="text-[10px] text-gray-400 hidden sm:block">Hệ thống kết nối hiến máu</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors no-underline"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="contained"
              startIcon={<LocalHospitalIcon />}
              onClick={() => navigate('/auth')}
              sx={{
                backgroundColor: '#dc2626',
                '&:hover': { backgroundColor: '#b91c1c' },
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
                px: 2,
                py: 0.8,
              }}
            >
              Đăng ký
            </Button>

            {isAuthenticated && user ? (
              <>
                <IconButton onClick={handleUserMenuOpen} sx={{ p: 0.5 }}>
                  <Avatar
                    sx={{ width: 36, height: 36, bgcolor: '#2563eb', fontSize: '0.875rem' }}
                  >
                    {user.name.charAt(0)}
                  </Avatar>
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleUserMenuClose}>
                  <MenuItem onClick={handleDashboard}>📊 Dashboard</MenuItem>
                  <MenuItem onClick={handleLogout}>🚪 Đăng xuất</MenuItem>
                </Menu>
              </>
            ) : (
              <Button
                variant="outlined"
                startIcon={<PersonOutlineIcon />}
                onClick={() => navigate('/auth/login')}
                sx={{
                  borderColor: '#2563eb',
                  color: '#2563eb',
                  '&:hover': { borderColor: '#1d4ed8', backgroundColor: '#eff6ff' },
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  px: 2,
                  py: 0.8,
                }}
              >
                Đăng nhập
              </Button>
            )}
          </div>

          {/* Mobile Hamburger */}
          <IconButton
            className="lg:hidden"
            onClick={() => setDrawerOpen(true)}
            sx={{ display: { md: 'none' }, color: '#374151' }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 280 } }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="text-lg font-bold text-red-600">BloodConnect</span>
          <IconButton onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List>
          {NAV_LINKS.map((link) => (
            <ListItemButton
              key={link.label}
              component="a"
              href={link.href}
              onClick={() => setDrawerOpen(false)}
            >
              <ListItemText primary={link.label} />
            </ListItemButton>
          ))}
        </List>
        <Divider />
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<LocalHospitalIcon />}
            onClick={() => { navigate('/auth/register/hospital'); setDrawerOpen(false) }}
            sx={{
              backgroundColor: '#dc2626',
              '&:hover': { backgroundColor: '#b91c1c' },
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Đăng ký Bệnh viện
          </Button>
          {isAuthenticated ? (
            <>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => { handleDashboard(); setDrawerOpen(false) }}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
              >
                Dashboard
              </Button>
              <Button
                variant="text"
                fullWidth
                onClick={() => { handleLogout(); setDrawerOpen(false) }}
                sx={{ borderRadius: '8px', textTransform: 'none', color: '#dc2626' }}
              >
                Đăng xuất
              </Button>
            </>
          ) : (
            <Button
              variant="outlined"
              fullWidth
              startIcon={<PersonOutlineIcon />}
              onClick={() => { navigate('/auth/login'); setDrawerOpen(false) }}
              sx={{
                borderColor: '#2563eb',
                color: '#2563eb',
                '&:hover': { borderColor: '#1d4ed8', backgroundColor: '#eff6ff' },
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Đăng nhập
            </Button>
          )}
        </Box>
      </Drawer>
    </>
  )
}

export default Header
