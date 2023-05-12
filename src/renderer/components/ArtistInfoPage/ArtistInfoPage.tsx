/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useContext } from 'react';
import { AppContext } from 'renderer/contexts/AppContext';
import { AppUpdateContext } from 'renderer/contexts/AppUpdateContext';
import calculateTimeFromSeconds from 'renderer/utils/calculateTimeFromSeconds';
import useSelectAllHandler from 'renderer/hooks/useSelectAllHandler';

import { Album } from '../AlbumsPage/Album';
import Song from '../SongsPage/Song';
import Button from '../Button';
import MainContainer from '../MainContainer';
import Hyperlink from '../Hyperlink';
import Img from '../Img';
import Dropdown from '../Dropdown';

import SeparateArtistsSuggestion from './SeparateArtistsSuggestion';
import DuplicateArtistsSuggestion from './DuplicateArtistsSuggestion';

const dropdownOptions: { label: string; value: SongSortTypes }[] = [
  { label: 'Added Order', value: 'addedOrder' },
  { label: 'A to Z', value: 'aToZ' },
  { label: 'Z to A', value: 'zToA' },
  { label: 'Newest', value: 'dateAddedAscending' },
  { label: 'Oldest', value: 'dateAddedDescending' },
  { label: 'Released Year (Ascending)', value: 'releasedYearAscending' },
  { label: 'Released Year (Descending)', value: 'releasedYearDescending' },
  {
    label: 'Most Listened (All Time)',
    value: 'allTimeMostListened',
  },
  {
    label: 'Least Listened (All Time)',
    value: 'allTimeLeastListened',
  },
  {
    label: 'Most Listened (This Month)',
    value: 'monthlyMostListened',
  },
  {
    label: 'Least Listened (This Month)',
    value: 'monthlyLeastListened',
  },
  {
    label: 'Artist Name (A to Z)',
    value: 'artistNameAscending',
  },
  {
    label: 'Artist Name (Z to A)',
    value: 'artistNameDescending',
  },
  { label: 'Album Name (A to Z)', value: 'albumNameAscending' },
  {
    label: 'Album Name (Z to A)',
    value: 'albumNameDescending',
  },
];

const ArtistInfoPage = () => {
  const {
    currentlyActivePage,
    queue,
    isDarkMode,
    bodyBackgroundImage,
    localStorageData,
  } = useContext(AppContext);
  const {
    createQueue,
    updateQueueData,
    addNewNotifications,
    updateBodyBackgroundImage,
    updateCurrentlyActivePageData,
  } = React.useContext(AppUpdateContext);

  const [artistData, setArtistData] = React.useState<ArtistInfo>();
  const [albums, setAlbums] = React.useState<Album[]>([]);
  const [songs, setSongs] = React.useState<SongData[]>([]);
  const [sortingOrder, setSortingOrder] = React.useState<SongSortTypes>('aToZ');

  const fetchArtistsData = React.useCallback(() => {
    if (currentlyActivePage?.data?.artistId) {
      window.api
        .getArtistData([currentlyActivePage.data.artistId])
        .then((res) => {
          if (res && res.length > 0) {
            if (res[0].onlineArtworkPaths?.picture_medium)
              updateBodyBackgroundImage(
                true,
                res[0].onlineArtworkPaths?.picture_medium
              );
            setArtistData(res[0]);
          }
          return undefined;
        })
        .catch((err) => console.error(err));
    }
  }, [currentlyActivePage.data, updateBodyBackgroundImage]);

  const fetchArtistArtworks = React.useCallback(() => {
    if (artistData?.artistId) {
      window.api
        .getArtistArtworks(artistData.artistId)
        .then((x) => {
          if (x)
            setArtistData((prevData) => {
              if (prevData)
                return {
                  ...prevData,
                  onlineArtworkPaths: x.artistArtworks,
                  artistPalette: x.artistPalette || prevData.artistPalette,
                  artistBio: x.artistBio || prevData.artistBio,
                };
              return undefined;
            });
          return undefined;
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [artistData?.artistId]);

  const fetchSongsData = React.useCallback(() => {
    if (artistData?.songs && artistData.songs.length > 0) {
      window.api
        .getSongInfo(artistData.songs.map((song) => song.songId))
        .then((songsData) => {
          if (songsData && songsData.length > 0) setSongs(songsData);
          return undefined;
        })
        .catch((err) => console.error(err));
    }
  }, [artistData?.songs]);

  const fetchAlbumsData = React.useCallback(() => {
    if (artistData?.albums && artistData.albums.length > 0) {
      window.api
        .getAlbumData(artistData.albums.map((album) => album.albumId))
        .then((res) => {
          if (res && res.length > 0) setAlbums(res);
          return undefined;
        })
        .catch((err) => console.error(err));
    }
  }, [artistData?.albums]);

  React.useEffect(() => {
    fetchArtistsData();
    const manageArtistDataUpdatesInArtistInfoPage = (e: Event) => {
      const dataEvents = (e as DetailAvailableEvent<DataUpdateEvent[]>).detail;
      if ('detail' in e) {
        for (let i = 0; i < dataEvents.length; i += 1) {
          const event = dataEvents[i];
          if (event.dataType === 'artists') fetchArtistsData();
        }
      }
    };
    document.addEventListener(
      'app/dataUpdates',
      manageArtistDataUpdatesInArtistInfoPage
    );
    return () => {
      document.removeEventListener(
        'app/dataUpdates',
        manageArtistDataUpdatesInArtistInfoPage
      );
    };
  }, [fetchArtistsData]);

  React.useEffect(() => {
    fetchArtistArtworks();
    const manageArtistArtworkUpdatesInArtistInfoPage = (e: Event) => {
      const dataEvents = (e as DetailAvailableEvent<DataUpdateEvent[]>).detail;
      if ('detail' in e) {
        for (let i = 0; i < dataEvents.length; i += 1) {
          const event = dataEvents[i];
          if (event.dataType === 'artists/artworks') fetchArtistArtworks();
        }
      }
    };
    document.addEventListener(
      'app/dataUpdates',
      manageArtistArtworkUpdatesInArtistInfoPage
    );
    return () => {
      document.removeEventListener(
        'app/dataUpdates',
        manageArtistArtworkUpdatesInArtistInfoPage
      );
    };
  }, [fetchArtistArtworks]);

  React.useEffect(() => {
    fetchSongsData();
    const manageSongDataUpdatesInArtistInfoPage = (e: Event) => {
      const dataEvents = (e as DetailAvailableEvent<DataUpdateEvent[]>).detail;
      if ('detail' in e) {
        for (let i = 0; i < dataEvents.length; i += 1) {
          const event = dataEvents[i];
          if (
            event.dataType === 'songs/deletedSong' ||
            event.dataType === 'songs/newSong' ||
            event.dataType === 'blacklist/songBlacklist' ||
            (event.dataType === 'songs/likes' && event.eventData.length > 1)
          )
            fetchSongsData();
        }
      }
    };
    document.addEventListener(
      'app/dataUpdates',
      manageSongDataUpdatesInArtistInfoPage
    );
    return () => {
      document.removeEventListener(
        'app/dataUpdates',
        manageSongDataUpdatesInArtistInfoPage
      );
    };
  }, [fetchSongsData]);

  React.useEffect(() => {
    fetchAlbumsData();
    const manageAlbumDataUpdatesInArtistInfoPage = (e: Event) => {
      const dataEvents = (e as DetailAvailableEvent<DataUpdateEvent[]>).detail;
      if ('detail' in e) {
        for (let i = 0; i < dataEvents.length; i += 1) {
          const event = dataEvents[i];
          if (event.dataType === 'albums/newAlbum') fetchAlbumsData();
          if (event.dataType === 'albums/deletedAlbum') fetchAlbumsData();
        }
      }
    };
    document.addEventListener(
      'app/dataUpdates',
      manageAlbumDataUpdatesInArtistInfoPage
    );
    return () => {
      document.removeEventListener(
        'app/dataUpdates',
        manageAlbumDataUpdatesInArtistInfoPage
      );
    };
  }, [fetchAlbumsData]);

  const calculateTotalTime = React.useCallback(() => {
    const { hours, minutes, seconds } = calculateTimeFromSeconds(
      songs.reduce((prev, current) => prev + current.duration, 0)
    );
    return `${
      hours >= 1 ? `${hours} hour${hours === 1 ? '' : 's'} ` : ''
    }${minutes} minute${minutes === 1 ? '' : 's'} ${seconds} second${
      seconds === 1 ? '' : 's'
    }`;
  }, [songs]);

  const sanitizeArtistBio = React.useCallback(() => {
    if (artistData?.artistBio) {
      const x = artistData.artistBio.match(/<a .*<\/a>/gm);
      const y = x ? x[0].match(/".*"/gm) : [''];
      const link = y ? y[0].replace(/"/gm, '') : '';
      return (
        <>
          <span className="artist-bio z-10">
            {artistData.artistBio.replace(/<a .*<\/a>/gm, '')}
          </span>
          <Hyperlink
            label="Read more..."
            linkTitle={`Read more about '${artistData.name}'`}
            link={link}
          />
        </>
      );
    }
    return '';
  }, [artistData]);

  const selectAllHandlerForAlbums = useSelectAllHandler(
    albums,
    'album',
    'albumId'
  );

  const albumComponents = React.useMemo(
    () =>
      albums.map((album, index) => {
        return (
          <Album
            index={index}
            key={`${album.albumId}-${album.title}`}
            albumId={album.albumId}
            artists={album.artists}
            artworkPaths={album.artworkPaths}
            songs={album.songs}
            title={album.title}
            year={album.year}
            className={
              bodyBackgroundImage
                ? '[&_:not(.icon)]:!text-font-color-white'
                : ''
            }
            selectAllHandler={selectAllHandlerForAlbums}
          />
        );
      }),
    [albums, bodyBackgroundImage, selectAllHandlerForAlbums]
  );

  const selectAllHandlerForSongs = useSelectAllHandler(
    songs,
    'songs',
    'songId'
  );

  const songComponenets = React.useMemo(
    () =>
      songs.map((song, index) => {
        return (
          <Song
            key={song.songId}
            index={index}
            isIndexingSongs={
              localStorageData?.preferences?.isSongIndexingEnabled
            }
            title={song.title}
            artists={song.artists}
            album={song.album}
            duration={song.duration}
            songId={song.songId}
            artworkPaths={song.artworkPaths}
            path={song.path}
            isAFavorite={song.isAFavorite}
            year={song.year}
            isBlacklisted={song.isBlacklisted}
            selectAllHandler={selectAllHandlerForSongs}
          />
        );
      }),
    [
      localStorageData?.preferences?.isSongIndexingEnabled,
      selectAllHandlerForSongs,
      songs,
    ]
  );

  const fontColor = React.useMemo(() => {
    if (
      artistData?.artistPalette &&
      artistData.artistPalette?.LightMuted &&
      artistData.artistPalette?.LightVibrant
    ) {
      const { LightVibrant, LightMuted } = artistData.artistPalette;
      const [r, g, b] = isDarkMode ? LightVibrant.rgb : LightMuted.rgb;

      return `rgb(${r},${g},${b})`;
    }
    return undefined;
  }, [artistData?.artistPalette, isDarkMode]);

  return (
    <MainContainer className="artist-info-page-container appear-from-bottom relative overflow-y-auto rounded-tl-lg pb-2 pl-2 pr-2 pt-8">
      <div className="artist-img-and-info-container relative mb-12 flex flex-row items-center pl-8 [&>*]:z-10">
        <div className="artist-img-container relative mr-10 max-h-60 lg:hidden">
          <Img
            src={artistData?.onlineArtworkPaths?.picture_medium}
            fallbackSrc={artistData?.artworkPaths?.artworkPath}
            className="!aspect-square max-h-60 max-w-[15rem] rounded-full object-cover"
            alt="Album Cover"
          />
          <Button
            className="absolute bottom-4 right-2 !m-0 flex rounded-full !border-0 bg-background-color-1 !p-3 shadow-xl outline-1 -outline-offset-[6px] focus-visible:!outline dark:bg-dark-background-color-2"
            tooltipLabel={
              artistData?.isAFavorite
                ? `Dislike '${artistData?.name}'`
                : `Like '${artistData?.name}'`
            }
            iconName="favorite"
            iconClassName={`!text-3xl !leading-none ${
              artistData?.isAFavorite
                ? 'material-icons-round text-font-color-crimson'
                : 'material-icons-round material-icons-round-outlined !font-medium text-font-color-black/60 dark:text-font-color-white/60'
            }`}
            clickHandler={() => {
              if (artistData)
                window.api
                  .toggleLikeArtists(
                    [artistData.artistId],
                    !artistData.isAFavorite
                  )
                  .then(
                    (res) =>
                      res &&
                      setArtistData((prevData) =>
                        prevData
                          ? {
                              ...prevData,
                              isAFavorite: !prevData.isAFavorite,
                            }
                          : undefined
                      )
                  )
                  .catch((err) => console.error(err));
            }}
          />
        </div>
        <div
          className={`artist-info-container relative ${
            bodyBackgroundImage
              ? 'text-font-color-white'
              : 'text-font-color-black dark:text-font-color-white'
          } [&>*]:z-10`}
        >
          <div
            className="artist-name mb-2 text-5xl text-background-color-3 dark:text-background-color-3"
            style={
              fontColor
                ? {
                    color: fontColor,
                  }
                : undefined
            }
          >
            {artistData?.name || 'Unknown Artist'}
          </div>
          {artistData?.songs && (
            <div className="artist-no-of-songs">
              {artistData.albums && artistData.albums.length > 0
                ? `${artistData.albums.length} album${
                    artistData.albums.length === 1 ? '' : 's'
                  } `
                : '0 albums '}
              &bull;
              {` ${artistData.songs.length} song${
                artistData.songs.length === 1 ? '' : 's'
              } `}
            </div>
          )}
          {songs.length > 0 && (
            <div className="artist-total-songs-duration">
              {calculateTotalTime()}
            </div>
          )}
        </div>
      </div>

      <SeparateArtistsSuggestion
        name={artistData?.name}
        artistId={artistData?.artistId}
      />

      <DuplicateArtistsSuggestion
        name={artistData?.name}
        artistId={artistData?.artistId}
      />

      {albums && albums.length > 0 && (
        <MainContainer
          className="main-container albums-list-container relative [&>*]:z-10"
          focusable
          onKeyDown={(e) => {
            if (e.ctrlKey && e.key === 'a') {
              e.stopPropagation();
              selectAllHandlerForAlbums();
            }
          }}
        >
          <>
            <div
              className={`title-container ${
                bodyBackgroundImage
                  ? 'text-font-color-white'
                  : 'text-font-color-black dark:text-font-color-white'
              } mb-4 mt-1
                  text-2xl`}
            >
              Appears On Albums
            </div>
            <div className="albums-container flex flex-wrap">
              {albumComponents}
            </div>
          </>
        </MainContainer>
      )}
      {songs && songs.length > 0 && (
        <MainContainer
          className="main-container songs-list-container relative h-full pb-4 [&>*]:z-10"
          focusable
          onKeyDown={(e) => {
            if (e.ctrlKey && e.key === 'a') {
              e.stopPropagation();
              selectAllHandlerForSongs();
            }
          }}
        >
          <>
            <div
              className={`title-container ${
                bodyBackgroundImage
                  ? 'text-font-color-white'
                  : 'text-font-color-black dark:text-font-color-white'
              } mb-4 mt-1
                  flex items-center justify-between text-2xl`}
            >
              Appears on songs
              {artistData?.songs && artistData.songs.length > 0 && (
                <div className="artist-buttons mr-4 flex">
                  <Button
                    label="Play All"
                    iconName="play_arrow"
                    className={
                      bodyBackgroundImage
                        ? '!border-background-color-2/50 !text-font-color-white hover:!border-background-color-3 dark:!border-dark-background-color-2/50 dark:hover:!border-dark-background-color-3'
                        : 'text-font-color-black dark:text-font-color-white'
                    }
                    clickHandler={() =>
                      createQueue(
                        songs
                          .filter((song) => !song.isBlacklisted)
                          .map((song) => song.songId),
                        'artist',
                        false,
                        artistData.artistId,
                        true
                      )
                    }
                  />
                  <Button
                    tooltipLabel="Shuffle and Play"
                    iconName="shuffle"
                    className={
                      bodyBackgroundImage
                        ? '!border-background-color-2/50 !text-font-color-white hover:!border-background-color-3 dark:!border-dark-background-color-2/50 dark:hover:!border-dark-background-color-3'
                        : 'text-font-color-black dark:text-font-color-white'
                    }
                    clickHandler={() =>
                      createQueue(
                        songs
                          .filter((song) => !song.isBlacklisted)
                          .map((song) => song.songId),
                        'artist',
                        true,
                        artistData.artistId,
                        true
                      )
                    }
                  />
                  <Button
                    tooltipLabel="Add to Queue"
                    iconName="add"
                    className={
                      bodyBackgroundImage
                        ? '!border-background-color-2/50 !text-font-color-white hover:!border-background-color-3 dark:!border-dark-background-color-2/50 dark:hover:!border-dark-background-color-3'
                        : 'text-font-color-black dark:text-font-color-white'
                    }
                    clickHandler={() => {
                      updateQueueData(
                        undefined,
                        [...queue.queue, ...songs.map((song) => song.songId)],
                        false,
                        false
                      );
                      addNewNotifications([
                        {
                          id: 'addSongsToQueue',
                          delay: 5000,
                          content: (
                            <span>
                              Added {songs.length} song
                              {songs.length === 1 ? '' : 's'} to the queue.
                            </span>
                          ),
                        },
                      ]);
                    }}
                  />
                  <Dropdown
                    name="SongsSortDropdown"
                    className={
                      bodyBackgroundImage
                        ? '!border-background-color-2/50 !text-font-color-white hover:!border-background-color-3 active:!border-dark-background-color-3 dark:!border-dark-background-color-2/50 dark:hover:!border-dark-background-color-3 dark:active:!border-dark-background-color-3'
                        : 'text-font-color-black dark:text-font-color-white'
                    }
                    value={sortingOrder}
                    options={dropdownOptions}
                    onChange={(e) => {
                      const order = e.currentTarget.value as SongSortTypes;
                      updateCurrentlyActivePageData((currentPageData) => ({
                        ...currentPageData,
                        sortingOrder: order,
                      }));
                      setSortingOrder(order);
                    }}
                  />
                </div>
              )}
            </div>
            <div className="songs-container">{songComponenets}</div>
          </>
        </MainContainer>
      )}
      {artistData?.artistBio && (
        <div
          className={`"artist-bio-container appear-from-bottom relative z-10 m-4 rounded-lg p-4 text-font-color-black shadow-md  dark:text-font-color-white ${
            bodyBackgroundImage
              ? `bg-background-color-2/70 backdrop-blur-md dark:bg-dark-background-color-2/70`
              : `bg-background-color-2 dark:bg-dark-background-color-2`
          }`}
        >
          <h3 className="mb-2 font-medium uppercase text-font-color-highlight dark:text-dark-font-color-highlight">
            About {artistData.name}
          </h3>
          <div>{sanitizeArtistBio()}</div>
        </div>
      )}
    </MainContainer>
  );
};

export default ArtistInfoPage;
