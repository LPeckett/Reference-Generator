import { useState } from 'react'
import './App.css'
import { AppBar, Box, Button, CircularProgress, Container, Dialog, DialogContent, DialogTitle, Divider, IconButton, InputAdornment, Link, MenuItem, Select, Snackbar, TextField, Typography, setRef } from '@mui/material'
import { ContentCopy, Delete, Search } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import React from 'react';

interface SearchResult {
  title: string;
  subtitle: string;
  authors: Array<string>;
  publishedDate: string;
  startPage: string;
  endPage: string;
  town: string;
}

type SearchResultProps = {
  result: SearchResult;
  index: number;
}

function generateFootnoteBookReference(result: SearchResult) {
  return generateBookReference(result);
}

// Generates a bibliography style book reference for a book
function generateBookReference(result: SearchResult) {
  let reference: string = "";
    let numAdded: number = 0;

    for (let i = 0; i < result.authors.length; i++) {
      if (result.authors[i].length === 0)
        continue;

      if (numAdded == 0) {
        reference += getAuthorRefName(result.authors[i]);
      } else {
        reference += ", " + getAuthorRefName(result.authors[i]);
      }

      numAdded++;
    }

    reference += ", " + result.title + (result.subtitle.length != 0 ? ": " + result.subtitle : "") 
              + " (" + (result.town.length !== 0 ? result.town + ", " : "")  + getYearFromDate(result.publishedDate) + ")";
    return reference;
}

// Converts the author's name into the appropriate format for the reference
function getAuthorRefName(author: string) {
  const parts = author.split(' ');
  let refName = parts[parts.length - 1];

  for (let i = 0; i < parts.length - 1; i++) {
    refName += ", " + parts[i].charAt(0) + ".";
  }

  return refName;
}

// Extracts the year from a specified date
function getYearFromDate(date: string) {
  const parts = date.split('-');
  return parts[0];
}

function InformationDialog(props: SearchResultProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(props.result.title);
  const [subtitle, setSubTitle] = useState(props.result.subtitle);
  const [date, setDate] = useState(props.result.publishedDate);
  const [authors, setAuthors] = useState(props.result.authors);
  const [refCopied, setRefCopied] = useState(false);
  const [startPage, setStartPage] = useState("");
  const [endPage, setEndPage] = useState("");
  const [town, setTown] = useState("");

  const openClicked = () => {

    setOpen(!open);
  }

  const updateAuthorName = (event, i: number) => {
    setAuthors(authors.map((a, j) => {
      if (j == i) {
        return event.target.value;
      } else {
        return a;
      }
    }))
  }

  const addAuthorClicked = () => {
    setAuthors([...authors, ""]);
  }

  const deleteAuthorClicked = (i: number) => {
    setAuthors(authors.filter((a, j) => i !== j));
  }

  const copyToClipboardClicked = () => {
    navigator.clipboard.writeText(generateBookReference({authors: authors, title: title, subtitle: subtitle, publishedDate: date, 
      startPage:startPage, endPage:endPage, town:town}));
    setRefCopied(true);
  }

  const copyFootnoteReference = () => {
    navigator.clipboard.writeText(generateFootnoteBookReference({authors: authors, title: title, subtitle: subtitle, publishedDate: date, 
      startPage:startPage, endPage:endPage, town:town}));
    setRefCopied(true);
  }

  return(
    <>
      <React.Fragment>
        <IconButton onClick={openClicked}>
          <ContentCopy/>
        </IconButton>

        <Dialog 
          open={open} 
          onClose={()=> {setOpen(!open)}}
          maxWidth="sm"
          fullWidth>
          <DialogTitle>Edit Information</DialogTitle>
          <DialogContent sx={{display:"flex", flexDirection:"column", alignItems:"stretch", justifyContent:"start"}}>
            <TextField variant='outlined' label="Title" value={title} 
              onChange={(event) => {setTitle(event.target.value)}} sx={{mt:2, alignSelf:"grow"}}/>
            <TextField variant='outlined' label="Subtitle" value={subtitle} 
              onChange={(event) => {setSubTitle(event.target.value)}} sx={{mt:2, alignSelf:"grow"}}/>
            <TextField variant='outlined' label="Date" value={date} 
              onChange={(event) => {setDate(event.target.value)}} sx={{mt:2, alignSelf:"grow"}}/>

            <Box sx={{display:"flex", flexDirection:"row", mt:2}}>
              <TextField variant='outlined' label="Start Page" value={startPage} sx={{flex:1, mr:1}} onChange={(e) => setStartPage(e.target.value)}/>
              <TextField variant='outlined' label="End Page" value={endPage} sx={{flex:1, ml:1}} onChange={(e) => setEndPage(e.target.value)}/>
            </Box>

            <TextField variant='outlined' label="Town or City" value={town} onChange={(e) => setTown(e.target.value)} 
              sx={{mt:2}} />

            {authors.map((author, i) => {
              return (
                <TextField variant='outlined' label={"Author " + (i + 1)} value={authors[i]} 
                    onChange={(event) => updateAuthorName(event, i)} sx={{flex:1, mt:2}}
                    InputProps={{endAdornment: (
                      <InputAdornment className='clickableComponent' onClick={() => deleteAuthorClicked(i)} position='end'>
                        <Delete />
                      </InputAdornment>
                    )}}/>
              );
            })}

            <Typography className='clickableComponent' onClick={addAuthorClicked} variant='body1' sx={{display:"flex", flexDirection:"row", alignItems:"center", 
              color: (theme) => theme.palette.primary.main, mt:2, alignSelf:"end"}}>
              <AddIcon />
              Add Author
            </Typography>

            <Box sx={{display:"flex", flexDirection:"row", justifyContent:"center", mt:3}}>
              <Button variant='contained' onClick={copyFootnoteReference} sx={{mx:1}}>
                Footnote Reference
              </Button>
              <Button variant='contained' onClick={copyToClipboardClicked} sx={{mx:1}}>
                Bibliography Reference
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

        <Snackbar open={refCopied} autoHideDuration={5000} onClose={()=> {setRefCopied(false)}} message="Reference Copied To Clipboard"/>
      </React.Fragment>
    </>
  );
}

function SearchResultItem(props: SearchResultProps) {
  return (
    <>
      {props.index != 0 ? <Divider variant='fullWidth' sx={{mx:3}}/> : ""}
      <Box sx={{display:"flex", flexDirection:"row", flexBasis:1, mx:3, my:1}}>
        <Box sx={{display:"flex", flexDirection:"column", flexGrow:1}}>
          <Typography variant='h6'>
            {props.result.title + (props.result.subtitle.length != 0 ? ": " + props.result.subtitle : "")}
          </Typography>
          <Typography variant='body1'>
            {props.result.authors.length != 0 ? 
              props.result.authors.map((n, i) => {
                if (i == 0) {
                  return n;
                } else {
                  return ", " + n;
                }
              })
              : "Unknown Author"}
          </Typography>
          <Typography variant='body2'>
            {props.result.publishedDate !== "" ? props.result.publishedDate : "Unknown Date"}
          </Typography>
        </Box>
        <Box sx={{display:"flex", flexDirection:"column", justifyContent:"center"}}>
          <InformationDialog result={props.result} index={props.index}/>
        </Box>
      </Box>
    </>
  );
}

function App() {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState<Array<SearchResult>>([]);
  const [searchMode, setSearchMode] = useState(0);
  const [loading, setLoading] = useState(false);

  const searchModes = ["Google Books", "National Archive"];

  const searchClicked = () => {
    setResults([]);
    setLoading(true);
    if (searchMode == 0) {
      searchGBooks();
    } else if (searchMode == 1) {
      searchNationalArchives();
    }
    setSearchText("");
  }

  const searchGBooks = () => {
    axios.get(`https://www.googleapis.com/books/v1/volumes?q=${searchText}`)
      .then((response) => {
        let bookItems: SearchResult[] = [];
        response.data.items.map((item: any, num: number) => {
          const result: SearchResult = {
            title: item.volumeInfo.title, 
            authors: item.volumeInfo.authors ? item.volumeInfo.authors : [], 
            publishedDate: item.volumeInfo.publishedDate ? item.volumeInfo.publishedDate : "",
            subtitle: item.volumeInfo?.subtitle ? item.volumeInfo.subtitle : "",
          }
          bookItems.push(result);
        });
        setLoading(false);
        setResults(bookItems);
      });
  }

  const searchNationalArchives = () => {
    axios.get(`https://discovery.nationalarchives.gov.uk/API/search/v1/records?sps.searchQuery=${searchText}`)
      .then(response => {
        let aItems: SearchResult[] = [];
        response.data.records.map((item: any, num: number) => {
          const result: SearchResult = {
            title: item.title,
            authors: item.heldBy,
            publishedDate: item.endDate,
            subtitle: "",
          };
          aItems.push(result);
        });
        setLoading(false);
        setResults(aItems);
      });
  }



  const searchModeChanged = (event) => {
    setSearchMode(event.target.value);
  }

  return (
    <>
      <Container sx={{display:"flex", flexDirection:"column"}}>
        <Typography variant='h3' sx={{textAlign:"center", my:2}}>
          Search For An Author Or A Book Name
        </Typography>
        <Container sx={{display:"flex", flexDirection:"row"}}>
          <Select value={searchMode} onChange={searchModeChanged} autoWidth>
            {searchModes.map((name, i) => {
              return <MenuItem value={i}>{name}</MenuItem>;
            })}
          </Select>
          <TextField variant='outlined' label="Book Name or Author" sx={{flexGrow:1, mr:1}} 
            value={searchText} onChange={(e)=> {setSearchText(e.target.value)}}/>
          <Button variant='contained' endIcon={<Search/>} onClick={searchClicked}>
            Search
          </Button>
        </Container>

        {loading ? 
          <Box sx={{display:"flex", flexDirection:"row", justifyContent:"center", my:2}}>
            <CircularProgress />
          </Box> 
        : ""}

        {results.map((r, i) => {
          return (<SearchResultItem key={i} result={r} index={i}/>);
        })}
      </Container>
    </>
  )
}

export default App
