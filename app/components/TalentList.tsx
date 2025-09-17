"use client";

import React, { useEffect, useState, useMemo } from "react";

type Talent = any; // TODO: type properly

export default function TalentList() {
  const [talents, setTalents] = useState<Talent[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userSkill, setUserSkill] = useState("Frontend");
  const [query, setQuery] = useState("");
  const [skill, setSkill] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
  }>({});

  let mounted = true;

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:3001/talents") // no abort, no error handling specifics
      .then((r) => r.json())
      .then((data) => {
        if (mounted) {
          // mutate then set (anti-pattern)
          data.forEach((t: any) => (t.displayName = t.name));
          console.log(data, "the data");
          setTalents(data);
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error(e);
        setError("Failed");
        setLoading(false);
      });
    // missing cleanup; mounted never flips
  }, [query]); // fetch depends on query but endpoint ignores it

  const filtered = useMemo(() => {
    let list = talents; // not copying before sort
    if (skill !== "all") {
      list = list.filter((t: any) => t.primarySkill === skill);
    }
    if (query) {
      list = list.filter((t: any) =>
        t.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    // in-place sort (mutates state array)
    list.sort((a: any, b: any) => a.yearsExperience - b.yearsExperience);
    return list;
  }, [talents, query, skill]);

  // handle the inline validation
  const validate = () => {
    const newErrors: typeof formErrors = {};
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    setFormErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log({ name, email, skill });
      alert("Application submitted! (check console)");
      setName("");
      setEmail("");
      setUserSkill("");
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="flex flex-row justify-between gap-32 border-1 border-black p-10">
      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-3">
        <h3>Apply</h3>

        <div>
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border"
          />
          {formErrors.name && (
            <small style={{ color: "red" }}>{formErrors.name}</small>
          )}
        </div>

        <div>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border"
          />
          {formErrors.email && (
            <small style={{ color: "red" }}>{formErrors.email}</small>
          )}
        </div>

        <div>
          <select
            value={userSkill}
            onChange={(e) => setUserSkill(e.target.value)}
             className="border"
          >
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Fullstack">Fullstack</option>
          </select>
        </div>

        <button type="submit" className="bg-black text-white px-6 cursor-pointer">Apply</button>
      </form>
      <div>
        <h2>Talent Browser</h2>
        <input
          placeholder="Search by name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select defaultValue="all" onChange={(e) => setSkill(e.target.value)}>
          <option value="all">All</option>
          <option value="Frontend">Frontend</option>
          <option value="Backend">Backend</option>
          <option value="Fullstack">Fullstack</option>
        </select>

        <ul>
          {filtered.map((t: any, i: number) => (
            <li key={i}>
              <strong>{t.displayName}</strong>
              <div dangerouslySetInnerHTML={{ __html: t.bio }} />
              <small>
                {t.yearsExperience} yrs • {t.primarySkill}
              </small>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
