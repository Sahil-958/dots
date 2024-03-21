vim.opt.nu = true
vim.opt.relativenumber = false
vim.opt.tabstop = 4
vim.opt.softtabstop = 4
vim.opt.shiftwidth = 4
vim.opt.expandtab = true

vim.opt.smartindent = true

vim.opt.wrap = true

vim.opt.swapfile = false
vim.opt.backup = false
vim.opt.undodir = os.getenv("HOME") .. "/.vim/undodir"
vim.opt.undofile = true

vim.opt.hlsearch = false
vim.opt.incsearch = true

vim.opt.termguicolors = true

vim.opt.scrolloff = 8
vim.opt.signcolumn = "yes"
vim.opt.isfname:append("@-@")

vim.opt.updatetime = 50

vim.opt.textwidth = 80

-- Set colorcolumn to highlight columns after 'textwidth'
vim.opt.colorcolumn = tostring(vim.api.nvim_get_option('textwidth') + 1)
local hl_group = vim.api.nvim_get_hl_by_name('Visual', true)
local hl_group_bg = string.format("#%06x", hl_group.background)
vim.cmd('highlight ColorColumn guibg=' .. hl_group_bg .. ' gui=NONE')
-- vim.cmd('highlight ColorColumn guibg=#111111 gui=NONE')
vim.g.mapleader = " "
