// components/SidebarComponent/SearchBar.js
import React from 'react';

const SearchBar = ({ searchText, setSearchText, filterLayers }) => (
    <div className="sidebar-search">
        <input type="text" placeholder="Search" value={searchText} onChange={(e) => { setSearchText(e.target.value); filterLayers(); }} />
    </div>
);

export default SearchBar;
