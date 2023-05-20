/* eslint-disable react/jsx-no-useless-fragment */
import React from 'react';
import { AppContext } from 'renderer/contexts/AppContext';
import { AppUpdateContext } from 'renderer/contexts/AppUpdateContext';
import storage from 'renderer/utils/localStorage';

import Button from '../Button';

type Props = {
  name?: string;
  artistId?: string;
};
export const separateArtistsRegex =
  / and | [Ff](?:ea)?t\. |&|,|;|·| ?\| | ?\/ | ?\\ /gm;

const SeparateArtistsSuggestion = (props: Props) => {
  const { bodyBackgroundImage, currentSongData } = React.useContext(AppContext);
  const {
    addNewNotifications,
    changeCurrentActivePage,
    updateCurrentSongData,
  } = React.useContext(AppUpdateContext);

  const { name = '', artistId = '' } = props;

  const [isIgnored, setIsIgnored] = React.useState(false);
  const [isMessageVisible, setIsMessageVisible] = React.useState(true);

  const ignoredArtists = React.useMemo(
    () => storage.ignoredSeparateArtists.getIgnoredSeparateArtists(),
    []
  );

  React.useEffect(() => {
    if (ignoredArtists.length > 0)
      setIsIgnored(ignoredArtists.includes(artistId));
  }, [artistId, ignoredArtists]);

  const separatedArtistsNames = React.useMemo(() => {
    const artists = name.split(separateArtistsRegex);
    const filterArtists = artists.filter(
      (x) => x !== undefined && x.trim() !== ''
    );
    const trimmedArtists = filterArtists.map((x) => x.trim());

    return [...new Set(trimmedArtists)];
  }, [name]);

  const artistComponents = React.useMemo(() => {
    if (separatedArtistsNames.length > 0) {
      const artists = separatedArtistsNames.map((artist, i, arr) => {
        return (
          <>
            <span
              className="text-font-color-highlight dark:text-dark-font-color-highlight"
              key={artist}
            >
              {artist}
            </span>
            {i !== arr.length - 1 && (
              <span key={`${arr[i]}=>${arr[i + 1]}`}>
                {i === arr.length - 2 ? ' and ' : ', '}
              </span>
            )}
          </>
        );
      });

      return artists;
    }
    return [];
  }, [separatedArtistsNames]);

  const separateArtists = React.useCallback(
    (
      setIsDisabled: (_state: boolean) => void,
      setIsPending: (_state: boolean) => void
    ) => {
      setIsDisabled(true);
      setIsPending(true);

      window.api.suggestions
        .resolveSeparateArtists(artistId, separatedArtistsNames)
        .then((res) => {
          if (
            res?.updatedData &&
            currentSongData.songId === res.updatedData.songId
          ) {
            updateCurrentSongData((prevData) => ({
              ...prevData,
              ...res.updatedData,
            }));
          }
          setIsIgnored(true);
          changeCurrentActivePage('Home');

          return addNewNotifications([
            {
              content: 'Artist conflict resolved successfully.',
              delay: 5000,
              id: 'ArtistDuplicateSuggestion',
            },
          ]);
        })
        .finally(() => {
          setIsDisabled(false);
          setIsPending(false);
        })
        .catch((err) => console.error(err));
    },
    [
      addNewNotifications,
      artistId,
      changeCurrentActivePage,
      currentSongData.songId,
      separatedArtistsNames,
      updateCurrentSongData,
    ]
  );

  return (
    <>
      {separatedArtistsNames.length > 1 && !isIgnored && (
        <div
          className={`appear-from-bottom mx-auto mb-6 w-[90%] rounded-lg p-4 text-black shadow-md transition-[width,height] dark:text-white ${
            bodyBackgroundImage
              ? 'bg-background-color-2/75 backdrop-blur-sm dark:bg-dark-background-color-2/75'
              : 'bg-background-color-2 dark:bg-dark-background-color-2'
          } `}
        >
          <label
            htmlFor="toggleSuggestionBox"
            className="title-container flex cursor-pointer items-center justify-between font-medium text-font-color-highlight dark:text-dark-font-color-highlight"
          >
            <div className="flex items-center">
              <span className="material-icons-round-outlined mr-2 text-2xl">
                help
              </span>{' '}
              Suggestion{' '}
            </div>
            <div className="flex items-center">
              <span
                className="material-icons-round-outlined mr-4 text-xl"
                title="This feature is still in the experimental state."
              >
                science
              </span>
              <Button
                id="toggleSuggestionBox"
                className="!m-0 !border-0 !p-0 outline-1 outline-offset-1 hover:bg-background-color-1/50 focus-visible:!outline hover:dark:bg-dark-background-color-1/50"
                iconClassName="!leading-none !text-3xl"
                iconName={
                  isMessageVisible ? 'arrow_drop_up' : 'arrow_drop_down'
                }
                tooltipLabel={
                  isMessageVisible ? 'Hide suggestion' : 'Show suggestion'
                }
                clickHandler={() => setIsMessageVisible((state) => !state)}
              />
            </div>
          </label>
          {isMessageVisible && (
            <div>
              <div>
                <p className="mt-2 text-sm">
                  Are {artistComponents} {separatedArtistsNames.length} separate
                  artists?
                </p>
                <p className="mt-2 text-sm">
                  If they are, you can organize them by selecting them as
                  separate artists, or you can ignore this suggestion.
                </p>
              </div>
              <div className="mt-3 flex items-center">
                <Button
                  className="!border-0 bg-background-color-1/50 !px-4 !py-2 outline-1 transition-colors hover:bg-background-color-1 hover:!text-font-color-highlight focus-visible:!outline dark:bg-dark-background-color-1/50 dark:hover:bg-dark-background-color-1 dark:hover:!text-dark-font-color-highlight"
                  iconName="verified"
                  iconClassName="material-icons-round-outlined"
                  label={`Separate as ${separatedArtistsNames.length} artists`}
                  clickHandler={(_, setIsDisabled, setIsPending) =>
                    separateArtists(setIsDisabled, setIsPending)
                  }
                />
                <Button
                  className="!mr-0 !border-0 bg-background-color-1/50 !px-4 !py-2 outline-1 transition-colors hover:bg-background-color-1 hover:!text-font-color-highlight focus-visible:!outline dark:bg-dark-background-color-1/50 dark:hover:bg-dark-background-color-1 dark:hover:!text-dark-font-color-highlight"
                  iconName="do_not_disturb_on"
                  iconClassName="material-icons-round-outlined"
                  label="Ignore"
                  clickHandler={() => {
                    storage.ignoredSeparateArtists.setIgnoredSeparateArtists([
                      artistId,
                    ]);
                    setIsIgnored(true);
                    addNewNotifications([
                      {
                        id: 'suggestionIgnored',
                        icon: (
                          <span className="material-icons-round-outlined">
                            do_not_disturb_on
                          </span>
                        ),
                        delay: 5000,
                        content: <span>Suggestion ignored.</span>,
                      },
                    ]);
                  }}
                />
                <span
                  className="material-icons-round-outlined ml-4 cursor-pointer text-xl opacity-80 transition-opacity hover:opacity-100"
                  title="Keep in mind that seperating artists will update the library as well as metadata in songs linked these artists."
                >
                  info
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default SeparateArtistsSuggestion;