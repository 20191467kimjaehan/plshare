import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './GlobalCSS.css';

function PlaylistCard({ playlist, onSelect, onPlay }) {
    return (
        <div className="playlist-card" onClick={() => onSelect(playlist)}>
            <img
                src={playlist.items[0]?.thumbnail || 'https://via.placeholder.com/120'}
                alt={playlist.title}
                className="playlist-thumbnail"
            />
            <div className="playlist-info">
                <h3>{playlist.title || playlist.playlistId}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                        className="play-button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onPlay(playlist.playlistId);
                        }}
                    >
                        재생
                    </button>
                    <span className="playlist-tag">{playlist.tag || '태그 없음'}</span>
                </div>
            </div>
        </div>
    );
}

function AddPlaylistModal({ onAdd, onCancel, newPlaylistUrl, setNewPlaylistUrl, newTag, setNewTag }) {
    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3>새 재생목록 추가</h3>
                <input
                    type="text"
                    placeholder="유튜브 재생목록 URL"
                    value={newPlaylistUrl}
                    onChange={(e) => setNewPlaylistUrl(e.target.value)}
                    className="input-url"
                />
                <input
                    type="text"
                    placeholder="태그 (예: Pop, Jazz)"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="input-url"
                />
                <div className="modal-buttons">
                    <button onClick={onAdd} className="add-button">추가</button>
                    <button onClick={onCancel} className="cancel-button">취소</button>
                </div>
            </div>
        </div>
    );
}


function PLView({ currentUserID }) {
  const [playlists, setPlaylists] = useState([])
  const [isAdding, setIsAdding] = useState(false)
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)
  const [newPlaylistUrl, setNewPlaylistUrl] = useState('')
  const [newTag, setNewTag] = useState('')
  const [searchTag, setSearchTag] = useState('')
  const [filteredPlaylists, setFilteredPlaylists] = useState([])

  const fetchPlaylists = () => {
      axios.get('http://localhost:8080/playlistData')
          .then((response) => {
              setPlaylists(response.data)
              setFilteredPlaylists(response.data)
          })
          .catch((err) => console.error(err))
  };

  const handleSearch = () => {
      const filtered = playlists.filter((playlist) =>
          playlist.tag?.toLowerCase().includes(searchTag.toLowerCase())
      );
      setFilteredPlaylists(filtered);
  };

    const handleAddPlaylist = () => {
        if (!newPlaylistUrl || !newTag) {
            alert('URL과 태그를 모두 입력해주세요.');
            return;
        }

        axios.post('http://localhost:8080/shareplaylist', {
            url: newPlaylistUrl,
            tag: newTag,
            uploader: currentUserID
        })
            .then((response) => {
                if (response.data.ok) {
                    alert('재생목록이 성공적으로 추가되었습니다.');
                    setIsAdding(false);
                    setNewPlaylistUrl('');
                    setNewTag('');
                    fetchPlaylists();
                } else {
                    alert(response.data.message || '재생목록 추가에 실패했습니다.');
                }
            })
            .catch((err) => {
                if (err.response?.status === 409) {
                    alert('이미 추가된 재생목록입니다.');
                } else {
                    console.error(err);
                    alert('서버와 통신 중 오류가 발생했습니다.');
                }
            });
    };

    const handlePlayPlaylist = (playlistId) => {
        window.open(`https://www.youtube.com/playlist?list=${playlistId}`, '_blank');
    };

    const handleDeletePlaylist = (playlistId) => {
        axios.delete(`http://localhost:8080/rmplaylist/${playlistId}`)
            .then(() => {
                alert('재생목록이 삭제되었습니다.');
                setSelectedPlaylist(null);
                fetchPlaylists();
            })
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        fetchPlaylists();
    }, []);

    if (selectedPlaylist) {
        const isUploader = selectedPlaylist.uploader === currentUserID;

        return (
            <div className="playlist-detail">
                <h2>{selectedPlaylist.title}</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="back-button" onClick={() => setSelectedPlaylist(null)}>뒤로</button>
                        <button className="play-button" onClick={() => handlePlayPlaylist(selectedPlaylist.playlistId)}>재생</button>
                        {isUploader && (
                            <button
                                className="delete-button"
                                onClick={() => handleDeletePlaylist(selectedPlaylist.playlistId)}
                                style={{ backgroundColor: 'red', color: 'white' }}
                            >
                                삭제
                            </button>
                        )}
                    </div>
                    <div style={{ textAlign: 'right', fontSize: '14px', color: '#555' }}>
                        <div>업로더: {selectedPlaylist.uploader || '알 수 없음'}</div>
                        <div>태그: {selectedPlaylist.tag || '태그 없음'}</div>
                    </div>
                </div>
                <div className="playlist-items">
                    {selectedPlaylist.items.map((item) => (
                        <div key={item.videoId} className="playlist-item">
                            <img src={item.thumbnail} alt={item.title} className="item-thumbnail" />
                            <p>{item.title}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
      <div className="plview-container">
          <h2>재생목록</h2>
          <div className="search-container">
              <input
                  type="text"
                  placeholder="태그로 검색"
                  value={searchTag}
                  onChange={(e) => setSearchTag(e.target.value)}
                  className="search-input"
              />
              <button className="search-button" onClick={handleSearch}>검색</button>
          </div>
          <div className="playlists-grid">
              {filteredPlaylists.map((playlist) => (
                  <PlaylistCard
                      key={playlist.playlistId}
                      playlist={playlist}
                      onSelect={setSelectedPlaylist}
                      onPlay={handlePlayPlaylist}
                  />
              ))}
          </div>
          <div className="action-buttons">
              <button className="play-button" onClick={() => setIsAdding(true)}>재생목록 추가</button>
          </div>
          {isAdding && (
              <AddPlaylistModal
                  onAdd={handleAddPlaylist}
                  onCancel={() => setIsAdding(false)}
                  newPlaylistUrl={newPlaylistUrl}
                  setNewPlaylistUrl={setNewPlaylistUrl}
                  newTag={newTag}
                  setNewTag={setNewTag}
              />
          )}
      </div>
  );

    
}

export default PLView;