import React, { Component } from 'react';
import MonacoEditor from 'react-monaco-editor';

export default class Editor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      decorations: [],
      editor: null,
    };
  }

  startTimer = () => {
    const { onChange, debounceTimeout } = this.props;
    const { value } = this.state;
    this.timer = setTimeout(() => {
      onChange(value);
    }, debounceTimeout);
  }

  stopTimer = () => {
    clearTimeout(this.timer);
  }

  handleChange = (val) => {
    this.setState({ value: val });
    this.stopTimer();
    this.startTimer();
  }

  displayErrors = (errors) => {
    if (errors.length !== 0) {
      const {
        editor,
        decorations: previousDecorations = [],
      } = this.state;
      const decorations = editor.deltaDecorations(previousDecorations, errors.map(error => (
        {
          // eslint-disable-next-line no-undef
          range: new monaco.Range(
            error.lineNumber,
            error.startPosition,
            error.lineNumber,
            error.endPosition,
          ),
          options: { inlineClassName: 'myInlineDecoration' },
        }
      )));
      this.setState({ decorations });
    }
  }

  editorDidMount = (editor) => {
    editor.focus();
    this.setState({ editor });
  }

  render() {
    const options = {
      selectOnLineNumbers: true,
      glyphMargin: true,
      minimap: {
        enabled: false,
      },
    };

    const { value } = this.state;

    return (
      <MonacoEditor
        height="400"
        language="haskell"
        theme="vs-dark"
        value={value}
        options={options}
        onChange={this.handleChange}
        editorDidMount={this.editorDidMount}
      />
    );
  }
}
