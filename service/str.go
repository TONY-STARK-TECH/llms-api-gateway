package service

import (
	"bytes"
	"fmt"
	"one-api/constant"
	"strings"

	goahocorasick "github.com/anknown/ahocorasick"
)

func InitAc() *goahocorasick.Machine {
	m := new(goahocorasick.Machine)
	dict := readRunes()
	if err := m.Build(dict); err != nil {
		fmt.Println(err)
		return nil
	}
	return m
}

func readRunes() [][]rune {
	var dict [][]rune

	for _, word := range constant.SensitiveWords {
		word = strings.ToLower(word)
		l := bytes.TrimSpace([]byte(word))
		dict = append(dict, bytes.Runes(l))
	}

	return dict
}
