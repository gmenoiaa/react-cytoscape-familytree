import './App.css';
import CytoscapeComponent from 'react-cytoscapejs/src/component'
import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'
import {buildData} from './data'

cytoscape.use(dagre)

const data = buildData(8)
const persons = Object.entries(data.persons).map(([id, person]) => ({ data: { id: id, name: person.name, gender: person.gender, type: 'person' } }))
const unions = Object.keys(data.unions).map(id => ({ data: { id, type: 'union' } }))
const edges = data.links.map(([left, right]) => ({ data: { id: `${left}-${right}`, source: left, target: right } }))

console.log('persons count', persons.length)

function App() {
  const layout = {
    name: 'dagre',
    fit: false,
    // ranker: 'longest-path'
    minLen: (edge) => {
      const { id } = edge._private.data
      return id.startsWith('id') ? 0 : 1
    },
    // edgeWeight: (edge) => {
    //   const { id } = edge._private.data
    //   return id.startsWith('id') ? 100 : 1
    // }
  }

  const style = [
    {
      selector: 'node[type = "person"]',
      style: {
        'content': 'data(name)',
        'text-valign': 'center',
        'text-halign': 'center',
        'shape': 'rectangle',
        'width': 150,
        'height': 50,
      }
    },
    {
      selector: 'node[gender = "male"]',
      style: {
        'background-color': 'blue',
      }
    },
    {
      selector: 'node[gender = "female"]',
      style: {
        'background-color': 'red',
      }
    },
    {
      selector: 'node[type = "union"]',
      style: {
        'background-color': '#eee',
      }
    },
    {
      selector: ':parent',
      css: {
        'text-valign': 'top',
        'text-halign': 'center',
        // 'background-color': '#fff',
        // 'border-color': '#fff',
      }
    },
    {
      selector: 'edge',
      style: {
        'curve-style': 'bezier'
      }
    }
  ]

  const elements = CytoscapeComponent.normalizeElements({
    nodes: [
      ...persons,
      ...unions,
    ],
    edges
  })

  return (
    <CytoscapeComponent className="App" elements={elements} stylesheet={style} layout={layout} />
  );
}

export default App;
