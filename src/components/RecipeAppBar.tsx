import React, { useRef, useState, useLayoutEffect } from 'react'
import { useSelector } from 'react-redux'
import { getLoggedUser } from '../redux/recipeSlice'
import {
    AppBar,
    Box,
    Button,
    ClickAwayListener,
    Grow,
    IconButton,
    MenuItem,
    MenuList,
    Paper,
    Popper,
    TextField,
    Toolbar,
    Typography,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { useNavigate } from 'react-router'
import { Search } from '@mui/icons-material'
import { useAppDispatch } from '../redux/hooks'
import { fetchLogout } from '../redux/thunks'

export const RecipeAppBar = () => {

    const [openUserMenu, setOpenUserMenu] = useState(false);
    const [menuWidth, setMenuWidth] = useState<number | null>(null);

    const [searchTerm, setSearchTerm] = useState<string>('');

    const iconButtonRef = useRef<HTMLButtonElement>(null);

    const dispatch = useAppDispatch();

    const userLoggedIn = useSelector(getLoggedUser);

    const navigate = useNavigate();

    useLayoutEffect(() => {
        if (iconButtonRef.current) {
            setMenuWidth(iconButtonRef.current.offsetWidth);
        }
    }, []);

    const handleUserButtonClick = () => {
        if (!userLoggedIn) navigate('/sign-in')
        else {
            setOpenUserMenu((prevState) => !prevState)
        }
    }

    const handleProfileClick = () => {
        if (userLoggedIn)
            navigate(`/user/${userLoggedIn.uid}`);
    }

    const handleLogoutClick = () => {
        dispatch(fetchLogout());
        navigate('/');
    }

    const handleSearchSubmit = () => {
        if (searchTerm !== '')
            navigate(`/search?term=${searchTerm}`);
    }

    return (
        <AppBar position="static" sx={{ backgroundColor: "#5C3317" }}>
            <Toolbar>
                <IconButton
                    size="large"
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Recipe App
                </Typography>
                <Box>
                    <TextField variant="outlined" value={searchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} />
                    <Button onClick={handleSearchSubmit}>
                        <Search />
                    </Button>
                </Box>
                {userLoggedIn ? (
                    <div>
                        <IconButton
                            ref={iconButtonRef}
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                            onClick={handleUserButtonClick}
                        >
                            <AccountCircleIcon />
                            <Typography>{userLoggedIn.email}</Typography>
                        </IconButton>
                        <Popper
                            anchorEl={iconButtonRef.current}
                            open={openUserMenu}
                            role={undefined}
                            placement="bottom-start"
                            transition
                            disablePortal
                            style={{ width: menuWidth || undefined }}
                        >
                            {({ TransitionProps, placement }) => (
                                <Grow
                                    {...TransitionProps}
                                    style={{
                                        transformOrigin:
                                            placement === 'bottom-start'
                                                ? 'left top'
                                                : 'left bottom',
                                    }}
                                >
                                    <Paper>
                                        <ClickAwayListener
                                            onClickAway={() => { }}
                                        >
                                            <MenuList
                                                id="composition-menu"
                                                aria-labelledby="composition-button"
                                            >
                                                <MenuItem
                                                    onClick={handleProfileClick}>Profile</MenuItem>
                                                <MenuItem
                                                    onClick={handleLogoutClick}>Logout</MenuItem>
                                            </MenuList>
                                        </ClickAwayListener>
                                    </Paper>
                                </Grow>
                            )}
                        </Popper>
                    </div>

                ) : (
                    <Button color="inherit" onClick={handleUserButtonClick}>
                        Login
                    </Button>
                )}
            </Toolbar>
        </AppBar>
    )
}
