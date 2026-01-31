import { useState, useRef, useEffect, useMemo } from "react";
import styles from "./Multiselectdropdown.module.css";

export default function MultiSelectDropdown({
  options = [],              // [{ label, value }]
  value = [],                // [value]
  onChange,
  placeholder = "Select options",
  searchable = true,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleOption = (val) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const filteredOptions = useMemo(() => {
    if (!query) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, options]);

  const selectedLabels = options
    .filter((o) => value.includes(o.value))
    .map((o) => o.label);

  return (
    <div className={styles.wrapper} ref={ref}>
      <div
        className={styles.control}
        onClick={() => setOpen((v) => !v)}
      >
        {selectedLabels.length === 0 ? (
          <span className={styles.placeholder}>{placeholder}</span>
        ) : (
          <div className={styles.tags}>
            {selectedLabels.map((label) => (
              <span key={label} className={styles.tag}>
                {label}
              </span>
            ))}
          </div>
        )}
        <span className={styles.arrow}>▾</span>
      </div>

      {open && (
        <div className={styles.menu}>
          {searchable && (
            <input
              className={styles.search}
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          )}

          {filteredOptions.length === 0 && (
            <div className={styles.noResults}>No results</div>
          )}

          {filteredOptions.map((opt) => (
            <label key={opt.value} className={styles.option}>
              <input
                type="checkbox"
                checked={value.includes(opt.value)}
                onChange={() => toggleOption(opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
