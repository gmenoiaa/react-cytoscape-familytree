export function buildData(maxLevels = 2) {
    const persons = {}
    const unions = {}
    const links = []

    let personCounter = 0
    let unionCounter = 0

    function updatePerson(id, ownUnions, parentUnion) {
        const person = persons[id]

        if (!person) {
            throw Error('person not found with id ' + id)
        }

        for (const ownUnion of ownUnions) {
            let currentUnion = unions[ownUnion]
            if (!currentUnion) {
                unions[ownUnion] = {
                    id: ownUnion,
                    partner: [id],
                    children: [],
                }
                currentUnion = unions[ownUnion]
            } else if (!(currentUnion.partner || []).includes(id)) {
                currentUnion.partner = [
                    ...(currentUnion.partner || []),
                    id,
                ]
            }
            if (!links.find(([left, right]) => left === (currentUnion.id && right === id) || (right === id && left === currentUnion.id))) {
                links.push([id, currentUnion.id])
            }
        }

        if (parentUnion) {
            const currentUnion = unions[parentUnion]
            if (!currentUnion) {
                unions[parentUnion] = {
                    id: parentUnion,
                    partner: [],
                    children: [id],
                }
            } else {
                currentUnion.children = [
                    ...(currentUnion.children || []),
                    id,
                ]
            }
            if (!links.find(([left, right]) => (left === currentUnion.id && right === id) || (right === id && left === currentUnion.id))) {
                links.push([currentUnion.id, id])
            }
        }

        persons[id] = {
            ...person,
            own_unions: ownUnions,
            parent_union: parentUnion,
        }
        return person
    }

    function createPerson({ gender = 'male', ownUnions = [], parentUnion = null }) {
        const i = ++personCounter
        const id = 'id' + i
        const person = {
            id,
            gender,
            name: 'Person ' + i,
            birthyear: i,
            own_unions: ownUnions,
            parent_union: parentUnion,
        }

        for (const ownUnion of ownUnions) {
            let currentUnion = unions[ownUnion]
            if (!currentUnion) {
                unions[ownUnion] = {
                    id: ownUnion,
                    partner: [id],
                    children: [],
                }
                currentUnion = unions[ownUnion]
            } else if (!(currentUnion.partner || []).includes(id)) {
                currentUnion.partner = [
                    ...(currentUnion.partner || []),
                    id,
                ]
            }
            if (!links.find(([left, right]) => (left === currentUnion.id && right === id) || (right === id && left === currentUnion.id))) {
                links.push([id, currentUnion.id])
            }
        }

        if (parentUnion) {
            const currentUnion = unions[parentUnion]
            if (!currentUnion) {
                unions[parentUnion] = {
                    id: parentUnion,
                    partner: [],
                    children: [id],
                }
            } else {
                currentUnion.children = [
                    ...(currentUnion.children || []),
                    id,
                ]
            }
            if (!links.find(([left, right]) => (left === currentUnion.id && right === id) || (right === id && left === currentUnion.id))) {
                links.push([currentUnion.id, id])
            }
        }

        persons[id] = person
        return person
    }


    function buildUnionId() {
        return 'u' + (++unionCounter)
    }

    function createFamily(partner1, partner2, level = 0) {


        const uid = buildUnionId()

        updatePerson(partner1.id, [uid])
        updatePerson(partner2.id, [uid])

        if (level >= maxLevels) {
            return
        }

        for (let i = 0; i < 2; i++) {
            const child = createPerson({ gender: 'male', ownUnions: [], parentUnion: uid })
            const childPartner = createPerson({ gender: 'female' })
            createFamily(child, childPartner, level + 1)
        }
    }

    const partner1 = createPerson({ gender: 'male' })
    const partner2 = createPerson({ gender: 'female' })

    createFamily(partner1, partner2)

    return {
        persons,
        unions,
        links
    }
}


export const oldData = {
    nodes: [
        { data: { id: 'id1', name: 'Francis', type: 'person', gender: 'male' } },
        { data: { id: 'id2', name: 'Greta', type: 'person', gender: 'female' } },
        { data: { id: 'id3', name: 'Eric', type: 'person', gender: 'male' } },
        { data: { id: 'id4', name: 'Charlene', type: 'person', gender: 'female' } },
        { data: { id: 'id5', name: 'Iver', type: 'person', gender: 'male' } },
        { data: { id: 'id6', name: 'Dan', type: 'person', gender: 'male' } },
        { data: { id: 'id7', name: 'Klaus', type: 'person', gender: 'male' } },
        { data: { id: 'id8', name: 'Heinz', type: 'person', gender: 'male' } },
        { data: { id: 'id9', name: 'Jennifer', type: 'person', gender: 'female' } },
        { data: { id: 'id10', name: 'Lennart', type: 'person', gender: 'male' } },
        { data: { id: 'id11', name: 'Adam', type: 'person', gender: 'male' } },
        { data: { id: 'id12', name: 'Berta', type: 'person', gender: 'female' } },

        { data: { id: 'u1', type: 'union' } },
        { data: { id: 'u2', type: 'union' } },
        { data: { id: 'u3', type: 'union' } },
        { data: { id: 'u4', type: 'union' } },
        { data: { id: 'u5', type: 'union' } },
    ],
      edges: [
    { data: { id: 'id1-u1', source: 'id1', target: 'u1' } },
    { data: { id: 'id2-u1', source: 'id2', target: 'u1' } },
    { data: { id: 'u1-id3', source: 'u1', target: 'id3' } },

    { data: { id: 'id3-u2', source: 'id3', target: 'u2' } },
    { data: { id: 'id4-u2', source: 'id4', target: 'u2' } },
    { data: { id: 'u2-id8', source: 'u2', target: 'id8' } },

    { data: { id: 'id8-u3', source: 'id8', target: 'u3' } },
    { data: { id: 'u3-id10', source: 'u3', target: 'id10' } },

    { data: { id: 'id4-u4', source: 'id4', target: 'u4' } },
    { data: { id: 'id5-u4', source: 'id5', target: 'u4' } },
    { data: { id: 'u4-id9', source: 'u4', target: 'id9' } },

    { data: { id: 'id11-u5', source: 'id11', target: 'u5' } },
    { data: { id: 'id12-u5', source: 'id12', target: 'u5' } },
    { data: { id: 'u5-id4', source: 'u5', target: 'id4' } },
    { data: { id: 'u5-id6', source: 'u5', target: 'id6' } },
    { data: { id: 'u5-id7', source: 'u5', target: 'id7' } },
]
}
