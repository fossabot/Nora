import React from 'react';

import {
  EditingLyricsLineData,
  ExtendedEditingLyricsLineData,
} from './LyricsEditingPage';
import Button from '../Button';

interface Props extends ExtendedEditingLyricsLineData {
  updateLineData: (
    callback: (
      prevLineData: ExtendedEditingLyricsLineData[]
    ) => ExtendedEditingLyricsLineData[]
  ) => void;
}

type EditingLyricsLineDataActions =
  | { type: 'UPDATE_LYRICS_TEXT'; payload: string }
  | { type: 'UPDATE_LYRICS_START_TAG'; payload: number }
  | { type: 'UPDATE_LYRICS_END_TAG'; payload: number }
  | { type: 'UPDATE_ALL_CONTENT'; payload: EditingLyricsLineData };

const reducerFunction = (
  state: EditingLyricsLineData,
  action: EditingLyricsLineDataActions
): EditingLyricsLineData => {
  switch (action.type) {
    case 'UPDATE_LYRICS_TEXT':
      return { ...state, line: action.payload };
    case 'UPDATE_LYRICS_START_TAG':
      return { ...state, start: action.payload };
    case 'UPDATE_LYRICS_END_TAG':
      return { ...state, end: action.payload };
    case 'UPDATE_ALL_CONTENT':
      return { ...state, ...action.payload };

    default:
      return state;
  }
};

const EditingLyricsLine = (props: Props) => {
  // const { songPosition } = React.useContext(SongPositionContext);

  const { line, index, isActive, end = 0, start = 0, updateLineData } = props;
  const [content, dispatch] = React.useReducer(reducerFunction, {
    line,
    start,
    end,
  } as EditingLyricsLineData);
  const [isEditing, setIsEditing] = React.useState(false);

  const lineRef = React.useRef<HTMLDivElement>(null);
  const isActiveRef = React.useRef(false);
  const resetLineDataRef = React.useRef<EditingLyricsLineData>({
    line,
    start,
    end,
  });

  React.useEffect(() => {
    dispatch({
      type: 'UPDATE_ALL_CONTENT',
      payload: {
        line,
        start,
        end,
      },
    });
  }, [end, line, start]);

  React.useEffect(() => {
    if (
      isActive &&
      // start &&
      // songPosition > start &&
      lineRef.current &&
      !isActiveRef.current
    ) {
      lineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }, [isActive, start]);

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={`mb-2 flex w-full flex-col items-center justify-center rounded-xl py-4 ${
        isEditing &&
        `bg-background-color-2 shadow-xl dark:bg-dark-background-color-2`
      } `}
      ref={lineRef}
      onKeyDown={(e) => isEditing && e.stopPropagation()}
    >
      <span className="text-xs opacity-50">
        {index < 10 ? `0${index}` : index}
      </span>
      {isEditing ? (
        <input
          type="text"
          placeholder="Lyrics Text"
          className="my-2 w-[90%] rounded-xl border-[3px] border-background-color-1 bg-background-color-2 px-4 py-4 text-center dark:border-dark-background-color-1 dark:bg-dark-background-color-2"
          value={content.line}
          onChange={(e) =>
            dispatch({
              type: 'UPDATE_LYRICS_TEXT',
              payload: e.currentTarget.value,
            })
          }
        />
      ) : (
        <span
          className={`scale-75 text-center text-4xl font-medium opacity-50 transition-[opacity,transform] ${
            isActive && '!scale-100 !opacity-100'
          }`}
        >
          {content.line}
        </span>
      )}
      {isEditing ? (
        <div className="flex items-center justify-center">
          From{' '}
          <input
            type="number"
            placeholder="Start in seconds"
            className="mx-2 my-1 min-w-[25%] rounded-xl border-[3px] border-background-color-1 bg-background-color-2 px-1 py-2 text-center dark:border-dark-background-color-1 dark:bg-dark-background-color-2"
            value={content.start ?? 0}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_LYRICS_START_TAG',
                payload: e.currentTarget.valueAsNumber,
              })
            }
          />{' '}
          to{' '}
          <input
            type="number"
            placeholder="End in seconds"
            className="mx-2 my-1 min-w-[25%] rounded-xl border-[3px] border-background-color-1 bg-background-color-2 px-1 py-2 text-center dark:border-dark-background-color-1 dark:bg-dark-background-color-2"
            value={content.end ?? 0}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_LYRICS_END_TAG',
                payload: e.currentTarget.valueAsNumber,
              })
            }
          />
        </div>
      ) : (
        <span className="text-xs opacity-75">
          From {content.start || '0.00'} to {content.end || '0.00'}
        </span>
      )}
      <div className="flex items-center justify-center">
        {isEditing && (
          <Button
            className="my-2 !border-0 !p-0 text-xs underline opacity-75"
            label="Reset"
            clickHandler={() =>
              dispatch({
                type: 'UPDATE_ALL_CONTENT',
                payload: resetLineDataRef.current,
              })
            }
          />
        )}
        <Button
          className="my-2 !mr-0 !border-0 !p-0 text-xs underline opacity-75"
          label={isEditing ? 'Finish Editing' : 'Edit'}
          clickHandler={() => {
            setIsEditing((isEditingState) => {
              if (isEditingState === true)
                updateLineData((prevLineData) => {
                  prevLineData[index] = {
                    ...prevLineData[index],
                    line: content.line || line,
                    start: content.start || start,
                    end: content.end || end,
                  };
                  return prevLineData;
                });
              return !isEditingState;
            });
          }}
        />
      </div>
    </div>
  );
};

export default EditingLyricsLine;
