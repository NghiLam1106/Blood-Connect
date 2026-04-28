import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
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
import { Logo } from './Logo'
import { AuthModal, type AuthView } from '../auth/AuthModal'

const NAV_LINKS = [
  { label: 'Trang chủ', href: '/' },
  { label: 'Tính năng', href: '/#features' },
  { label: 'Cách hoạt động', href: '/#process' },
  { label: 'Kiến thức hiến máu', href: '/knowledge' },
  { label: 'Hỏi đáp', href: '/faq' },
]

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout, authModalView, setAuthModalView } = useStore()
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
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #f1f5f9',
          zIndex: 1100,
        }}
      >
        <Toolbar className="container mx-auto flex items-center justify-between px-4 py-2">
          {/* Logo */}
          <Link to="/" className="no-underline">
            <Logo autoHideTextOnMobile={true} />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm font-semibold text-gray-700 hover:text-primary transition-colors no-underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <IconButton onClick={handleUserMenuOpen} sx={{ p: 0.5 }}>
                  <Avatar
                    sx={{ width: 36, height: 36, bgcolor: '#3B82F6', fontSize: '0.875rem' }}
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
              <>
                <Button
                  variant="outlined"
                  onClick={() => setAuthModalView('login')}
                  sx={{
                    borderColor: '#E5E7EB',
                    color: '#374151',
                    '&:hover': { borderColor: '#D1D5DB', backgroundColor: '#F3F4F6' },
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    px: 3,
                    py: 0.8,
                  }}
                >
                  Đăng nhập
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setAuthModalView('select')}
                  sx={{
                    backgroundColor: '#EF4444',
                    '&:hover': { backgroundColor: '#DC2626' },
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    px: 3,
                    py: 0.8,
                    boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2), 0 2px 4px -1px rgba(239, 68, 68, 0.1)'
                  }}
                >
                  Đăng ký
                </Button>
              </>
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
          <Logo />
          <IconButton onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List>
          {NAV_LINKS.map((link) => (
            <ListItemButton
              key={link.label}
              component={Link}
              to={link.href}
              onClick={() => setDrawerOpen(false)}
            >
              <ListItemText primary={<span className="font-semibold text-gray-700">{link.label}</span>} />
            </ListItemButton>
          ))}
        </List>
        <Divider />
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {isAuthenticated ? (
            <>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => { handleDashboard(); setDrawerOpen(false) }}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, borderColor: '#E5E7EB', color: '#1F2937' }}
              >
                Dashboard
              </Button>
              <Button
                variant="text"
                fullWidth
                onClick={() => { handleLogout(); setDrawerOpen(false) }}
                sx={{ borderRadius: '8px', textTransform: 'none', color: '#EF4444' }}
              >
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => { setAuthModalView('login'); setDrawerOpen(false) }}
                sx={{
                  borderColor: '#E5E7EB',
                  color: '#374151',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Đăng nhập
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={() => { setAuthModalView('select'); setDrawerOpen(false) }}
                sx={{
                  backgroundColor: '#EF4444',
                  '&:hover': { backgroundColor: '#DC2626' },
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Đăng ký ngay
              </Button>
            </>
          )}
        </Box>
      </Drawer>

      <AuthModal
        isOpen={authModalView !== null}
        onClose={() => setAuthModalView(null)}
        defaultView={(authModalView as AuthView) || 'login'}
      />
    </>
  )
}

export default Header
