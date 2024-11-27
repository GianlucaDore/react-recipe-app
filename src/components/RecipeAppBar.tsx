
import React, { useRef, useState, useLayoutEffect } from 'react'
import { getLoggedUser } from '../redux/recipeSlice'
import {
    AppBar,
    Avatar,
    Box,
    Button,
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
import { useNavigate } from 'react-router'
import { Search } from '@mui/icons-material'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { fetchLogout } from '../redux/thunks'
import defaultChef from 
'../assets/default_chef.jpeg'

export const RecipeAppBar = () => {

    const [openUserMenu, setOpenUserMenu] = useState(false);
    const [menuWidth, setMenuWidth] = useState<number | null>(null);

    const [searchTerm, setSearchTerm] = useState<string>('');

    const iconButtonRef = useRef<HTMLButtonElement>(null);

    const dispatch = useAppDispatch();

    const userLoggedIn = useAppSelector(getLoggedUser);

    const navigate = useNavigate();

    useLayoutEffect(() => {
        if (iconButtonRef.current) {
            setMenuWidth(iconButtonRef.current.offsetWidth);
        }
    }, []);


    const handleHomeClick = () => {
        navigate('/');
    }

    const handleUserButtonClick = () => {
        if (!userLoggedIn) {
            navigate('/sign-in');
        }
        else {
            setOpenUserMenu((prevState) => !prevState);
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

    const handleChangeSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    }

    const handleSearchSubmit = () => {
        if (searchTerm !== '')
            navigate(`/search?term=${searchTerm}`);
    }


    return (
        <AppBar position="sticky" sx={{ height: "64px" }}>
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
                <Typography variant="h6" component="div" onClick={handleHomeClick} sx={{ maxWidth: "fit-content", flexGrow: 1, cursor: "pointer" }}>
                    Recipe App
                </Typography>
                <Box marginLeft="auto" marginRight="25px" display="flex" justifyContent="center" alignContent="center">
                    <TextField 
                        variant="outlined" 
                        value={searchTerm} 
                        onChange={handleChangeSearch}
                        placeholder='Search...'
                        sx={{ borderRadius: '15px' }}
                    />
                    <Button onClick={handleSearchSubmit} sx={{ marginTop: 'auto', marginBottom: 'auto' }}>
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
                            onBlur={handleUserButtonClick}
                        >
                            <Avatar
                                src={(userLoggedIn.photoURL) ? userLoggedIn.photoURL : defaultChef} 
                                alt={(userLoggedIn.displayName) ? userLoggedIn.displayName : "Generic chef"}
                                sx={{ marginRight: "7px" }}
                            />
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
                                        <MenuList
                                            id="composition-menu"
                                            aria-labelledby="composition-button"
                                        >
                                            <MenuItem
                                                onClick={handleProfileClick}>Profile</MenuItem>
                                            <MenuItem
                                                onClick={handleLogoutClick}>Logout</MenuItem>
                                        </MenuList>
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
