use hdk::prelude::*;

#[hdk_entry(id = "item_entry")]
#[derive(Clone)]
pub struct Item(u32);

entry_defs![Item::entry_def(), PathEntry::entry_def()];

fn path_entry_hash() -> ExternResult<EntryHash> {
    let path = Path::from("items");
    path.ensure()?;
    let path_eh = path.path_entry_hash()?;
    Ok(path_eh)
}

#[hdk_extern]
pub fn create(ns: Vec<u32>) -> ExternResult<()> {
    for n in ns {
        let item = Item(n);
        let _ = create_entry(item.clone())?;
        let eh = hash_entry(item)?;

        let path_eh = path_entry_hash()?;
        create_link(path_eh, eh.clone(), LinkType(0), ())?;
    }

    Ok(())
}

#[hdk_extern]
pub fn list(_: ()) -> ExternResult<List> {
    let path_eh = path_entry_hash()?;
    let links = get_links(path_eh, None)?;
    let num_links = links.len();
    let items: Vec<Item> = links
        .into_iter()
        .flat_map(|l| get(l.target, Default::default()).unwrap())
        .flat_map(|el| el.entry.as_option().cloned())
        .map(|e| Item::try_from(e).unwrap())
        .collect();
    Ok(List { num_links, items })
}

#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct List {
    num_links: usize,
    items: Vec<Item>,
}
